<template>
    <v-container>
        <v-row>
            <v-btn elevation="2" @click="uploadFile()">Import File</v-btn>
            <v-spacer></v-spacer>
            <v-btn elevation="2" @click="resetFile()">Reset File</v-btn>
        </v-row>
        <v-file-input 
        v-model="myFile"
        prepend-icon=""
        accept=".json"
        class="hide"
        id="inputFile"
        @change="readFile"
        ></v-file-input>

        <v-card>
            <v-card-title>
                {{fileName}}
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                    class="searchInput"
                ></v-text-field>
                <v-icon class="deleteIcon" :disabled="disableDelete" @click="deleteSelected">mdi-delete</v-icon>
            </v-card-title>
            <v-data-table
                v-model="selected"
                show-select
                :headers = "headers"
                :items = "items"
                :search="search"
                v-bind:items-per-page= "itemsPerPage"
                v-bind:page= "page"
                class="elevation-1"
                id="table"
                :key="reRender"
                @pagination="paginate"
            >
                <template v-slot:body="{ items }">
                    <tbody>
                        <tr v-for="item in items" :key="item.Fileroot">
                            <td><v-checkbox :value="item.Fileroot" v-model="selected"></v-checkbox></td>
                            <td @click="clicked(item, 'Fileroot', false)">{{ item.Fileroot }}</td>
                            <td @click="clicked(item, 'Action', false)">{{ item.Action }}</td>
                            <td @click="clicked(item, 'Schema', false)">{{ displayList(item.Schema, 'Schema') }}</td>
                            <td @click="clicked(item, 'DataType', false)">{{ displayList(item.DataType, 'DataType') }}</td>
                            <td @click="clicked(item, 'Table', false)">{{ item.Table }}</td>
                            <td @click="clicked(item, 'Primary_Key', false)">{{ item.Primary_Key }}</td>
                            <td @click="clicked(item, 'Hash_Keys', false)">{{ displayList(item.Hash_Keys, 'Hash_Keys') }}</td>
                        </tr>
                    </tbody>
                </template>
                
            </v-data-table>
        </v-card>

        <v-row>
            <v-btn elevation="2" @click="newRecord">Create New Record</v-btn>
            <v-spacer></v-spacer>
            <v-btn elevation="2" @click="writeFile">Save as new file</v-btn>
        </v-row>


        <v-dialog v-model="dialog" width="500" v-bind:persistent="persistentDialog" ref="myDialog" :key=reRender>
            <v-card>
                <v-card-title>
                    Edit {{editAttribute}}
                </v-card-title>
                <v-card-text>
                    <v-form ref="form">
                        <v-textarea v-if="showBigInput"
                        v-model="editedItem[editAttribute]"
                        auto-grow
                        autofocus
                        rows="1"
                        ></v-textarea>
                        <v-text-field v-else v-model="editedItem[editAttribute]"
                        :rules="rules"
                        hide-details="auto"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        color="primary"
                        text
                        @click="resetAttribute"
                    >
                        Reset
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="saveAttribute"
                    >
                        Save
                    </v-btn>
                    </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
export default {
    name: 'ReadFileList',
    data: () => ({
        myFile: [],
        fileName: '',
        reRender: 0,
        search: '',
        rules: [],
        selected: [],
        dialog: false,
        itemsPerPage: 10,
        page: 1,
        pageCount: 1,
        itemToEdit: '',
        editedItem: '',
        editAttribute: '',
        showBigInput: false,
        persistentDialog: false,
        headers: [
            { text:'File Root', value: 'Fileroot'},
            { text:'Action', value: 'Action'},
            { text:'Schema', value: 'Schema'},
            { text:'Data Type', value: 'DataType'},
            { text:'Table', value: 'Table'},
            { text:'Primary Key', value: 'Primary_Key'},
            { text:'Hash Keys', value: 'Hash_Keys'},
        ],
        listHeaders: ['Schema', 'DataType', 'Hash_Keys'],
        items: [],
    }),
    computed: {
        disableDelete() {
            if (this.selected.length > 0) {
                return false
            }
            else {
                return true
            }
        },
    },
    watch: {
    },
    methods: {
        readFile(file) {
            this.asyncReadFile(file).then(result => {
                this.fileName = file.name
                var data = JSON.parse(result)
                this.items = Object.values(data)
                this.myFile = Object.values(data)
                this.forceRenderer()
                this.page = 1 
                this.editAttribute = ''
            })
            
        },
        async asyncReadFile(file) {
            let result = await new Promise((resolve) => {
                let fileReader = new FileReader()
                fileReader.onload = (e) => resolve(fileReader.result)
                fileReader.readAsText(file)
            })
            return result
        },
        writeFile() {
            var file = JSON.stringify(this.items, null, "\t")
            var fileSaver = require('file-saver')
            var blob = new Blob([file], {type: "application/json"})
            fileSaver.saveAs(blob, "filelist.json")
        },
        forceRenderer() {
            this.reRender += 1
        },
        displayList(listToDisplay, attribute) {
            if(attribute === 'Hash_Keys') {
                listToDisplay = listToDisplay.join(", ").slice(0, listToDisplay.join(", ").concat(" ").slice(0, 40).lastIndexOf(" "))
            }
            else {
                listToDisplay = listToDisplay.join(", ").slice(0,listToDisplay.join(", ").indexOf(" ", 40))
            }
            return listToDisplay
        },
        clicked(item, attribute, persistent) {
            this.persistentDialog = persistent
            this.itemToEdit = item
            this.editedItem = Object.assign({}, this.itemToEdit)
            this.editAttribute = attribute
            if (this.listHeaders.includes(this.editAttribute)) {
                this.showBigInput = true
                this.editedItem[this.editAttribute] = this.editedItem[this.editAttribute].join(", ")
            }
            else {
                this.showBigInput = false
            }
            this.rulesFunc()
            this.dialog = true
        },
        saveAttribute() {
            if (this.$refs.form.validate()) {
                this.dialog = false
                if (this.itemToEdit[this.editAttribute] != this.editedItem[this.editAttribute]) {
                    if (this.listHeaders.includes(this.editAttribute)) {
                        this.editedItem[this.editAttribute] = (this.editedItem[this.editAttribute]).split(", ")
                    }
                }
                for (var i of this.items) {
                    if (i == this.itemToEdit) {
                        this.items[this.items.indexOf(i)] = this.editedItem
                    }
                }
                this.forceRenderer()
            }
        },
        resetAttribute() {
            this.editedItem[this.editAttribute] = this.itemToEdit[this.editAttribute]
        },
        newRecord() {
            var newItem = {}
            for (var header of this.headers) {
                if (this.listHeaders.includes(header.value)) {
                    newItem[header.value] = []
                }
                else {
                    newItem[header.value] = ''
                }
            }
            this.items.push(newItem)
            this.forceRenderer()
            if (Math.ceil(this.items.length / this.itemsPerPage) > this.pageCount) {
                this.pageCount += 1
            }
            this.page = this.pageCount
            this.clicked(newItem, 'Fileroot', true)
        },
        paginate(val) {
            this.page = val.page
            this.itemsPerPage = val.itemsPerPage
            this.pageCount = val.pageCount
        },
        uploadFile() {
            document.getElementById("inputFile").click()
        },
        resetFile() {
            this.items = JSON.parse(JSON.stringify(this.myFile))
            this.forceRenderer()
            this.page = 1
        },
        deleteSelected() {
            var newItems = []
            for (var item of this.items) {
                if (!this.selected.includes(item.Fileroot)) {
                    newItems.push(item)
                }
            }
            this.items = newItems
            this.selected = []
        },
        rulesFunc() {
            if(this.editAttribute === "Fileroot") {
                const rule1 = value => !!value || 'Required.'
                this.rules.push(rule1)
                var fileRoots = []
                for (var i of this.items) {
                    fileRoots.push(i['Fileroot'])
                }
                const rule2 = value => (this.itemToEdit['Fileroot'] == value) || (fileRoots.indexOf(value) == -1) || 'Duplicate File Root'
                this.rules.push(rule2)
            }
            else {
                this.rules = []
            }
        },
    },
    mounted() {
        
    }
}
</script>

<style scoped>
    .v-btn {
        margin: 2em 1em;
    }

    .hide {
        display: none!important;
    }

    .deleteIcon {
        margin-left: 1em;
        margin-top:16px;
        font-size: 30px!important;
    }
    .container {
        margin-top: 64px!important;
    }
</style>
