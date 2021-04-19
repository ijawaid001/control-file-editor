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
        <v-data-table
            :headers = "headers"
            :items = "items"
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
                        <td @click="clicked(item, 'Fileroot', false)">{{ item.Fileroot }}</td>
                        <td @click="clicked(item, 'Action', false)">{{ item.Action }}</td>
                        <td @click="clicked(item, 'Schema', false)">{{ item.Schema.toString().slice(0,50) }}</td>
                        <td @click="clicked(item, 'DataType', false)">{{ item.DataType.toString().slice(0,50) }}</td>
                        <td @click="clicked(item, 'Table', false)">{{ item.Table }}</td>
                        <td @click="clicked(item, 'Primary_Key', false)">{{ item.Primary_Key }}</td>
                        <td @click="clicked(item, 'Hash_Keys', false)">{{ item.Hash_Keys.toString().slice(0,50) }}</td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>

        <v-row>
            <v-btn elevation="2" @click="newRecord">Create New Record</v-btn>
            <v-spacer></v-spacer>
            <v-btn elevation="2">Save as new file</v-btn>
        </v-row>


        <v-dialog v-model="dialog" width="500" v-bind:persistent="persistentDialog">
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
import filelist from '../assets/filelist.json'
export default {
    name: 'ReadFileList',
    data: () => ({
        myFile: [],
        reRender: 0,
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
        items: [],
    }),
    computed: {
        rules () {
            const rules = []
            if(this.editAttribute = 'Fileroot') {
                const rule1 = value => !!value || 'Required.'
                rules.push(rule1)
                var fileRoots = []
                for (var i of this.items) {
                    fileRoots.push(i['Fileroot'])
                }
                const rule2 = value => (this.itemToEdit['Fileroot'] == value) || (fileRoots.indexOf(value) == -1) || 'Duplicate File Root'
                rules.push(rule2)
            }
            return rules
        }
    },
    methods: {
        readFile(file) {
            this.asyncReadFile(file).then(result => {
                var data = JSON.parse(result)
                this.items = Object.values(data)
                this.myFile = Object.values(data)
                console.log(this.myFile)
                this.forceRenderer()
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
        forceRenderer() {
            this.reRender += 1
        },
        clicked(item, attribute, persistent) {
            this.persistentDialog = persistent
            this.itemToEdit = item
            this.editedItem = Object.assign({}, this.itemToEdit)
            this.editAttribute = attribute
            if (this.editAttribute == 'Schema' || this.editAttribute == 'DataType' || this.editAttribute == 'Hash_Keys') {
                this.showBigInput = true
            }
            else {
                this.showBigInput = false
            }
            this.dialog = true
        },
        saveAttribute() {
            if (this.$refs.form.validate()) {
                this.dialog = false
                if (this.itemToEdit[this.editAttribute] != this.editedItem[this.editAttribute]) {
                    if (this.editAttribute == 'Schema' || this.editAttribute == 'DataType' || this.editAttribute == 'Hash_Keys') {
                        this.editedItem[this.editAttribute] = (this.editedItem[this.editAttribute]).split(",")
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
                newItem[header.value] = ''
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
        }
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
</style>
