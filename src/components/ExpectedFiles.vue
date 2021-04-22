<template>
    <v-container>
        <v-row>
           
            <v-spacer></v-spacer>
            <v-btn elevation="2" @click="resetFile()">Reset Expected Files</v-btn>
        </v-row>
        <v-card>
            <v-card-title>
                Expected Files
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
                        <tr v-for="item in items" :key="item.PortcoID">
                            <td><v-checkbox :value="item.PortcoID" v-model="selected"></v-checkbox></td>
                            <td @click="clicked(item, 'FileNameRegex', false)">{{ item.FileNameRegex }}</td>
                            <td @click="clicked(item, 'FileRoot', false)">{{ item.FileRoot }}</td>
                            <td @click="clicked(item, 'FileSchema', false)">{{ displayList(item.FileSchema) }}</td>
                            <td @click="clicked(item, 'RemappingRequired', false)">{{ item.RemappingRequired }}</td>
                            <td @click="clicked(item, 'Delimiter', false)">{{ item.Delimiter }}</td>
                            <td @click="clicked(item, 'HeaderRowsToRemove', false)">{{ item.HeaderRowsToRemove }}</td>
                            <td @click="clicked(item, 'TrailingRowsToRemove', false)">{{ item.TrailingRowsToRemove }}</td>
                            <td @click="clicked(item, 'Key_Fields', false)">{{ displayList(item.Key_Fields) }}</td>
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
export default {
    name: 'ReadFileList',
    props: ['items'],
    data: () => ({
        myFile: [],
        fileName: '',
        portcoIDs: [],
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
            { text:'File Name Regex', value: 'FileNameRegex'},
            { text:'File Root', value: 'FileRoot'},
            { text:'File Schema', value: 'FileSchema'},
            { text:'Remapping Required', value: 'RemappingRequired'},
            { text:'Delimiter', value: 'Delimiter'},
            { text:'Header Rows To Remove', value: 'HeaderRowsToRemove'},
            { text:'Trailing Rows To Remove', value: 'TrailingRowsToRemove'},
            { text:'Key Fields', value: 'Key_Fields'}
        ],
        listHeaders: ['FileSchema','Key_Fields'],
        
    }),
    computed: {
        disableDelete() {
            if (this.selected.length > 0) {
                return false
            }
            else {
                return true
            }
        }
    },
    methods: {
        writeFile() {
            var file = JSON.stringify(this.items, null, "\t")
            var fileSaver = require('file-saver')
            var blob = new Blob([file], {type: "application/json"})
            fileSaver.saveAs(blob, "filelist.json")
        },
        forceRenderer() {
            this.reRender += 1
        },
        displayList(listToDisplay) {
            listToDisplay = listToDisplay.join(", ").slice(0,listToDisplay.join(", ").indexOf(" ", 40))
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
             if (this.listHeaders.includes(this.editAttribute)) {
                this.editedItem[this.editAttribute] = this.editedItem[this.editAttribute].join(", ")
            }
        },
        newRecord() {
            var newItem = {}
            for (var header of this.headers) {
                if (this.listHeaders.includes(this.editAttribute)) {
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
            this.clicked(newItem, 'PortcoID', true)
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
                if (!this.selected.includes(item.PortcoID)) {
                    newItems.push(item)
                }
            }
            this.items = newItems
            this.selected = []
        },
        rulesFunc() {
            if(this.editAttribute === "PortcoID") {
                const rule1 = value => !!value || 'Required.'
                this.rules.push(rule1)
                var portcoIDs = []
                for (var i of this.items) {
                    portcoIDs.push(i['PortcoID'])
                }
                const rule2 = value => (this.itemToEdit['PortcoID'] == value) || (portcoIDs.indexOf(value) == -1) || 'Duplicate PortcoID'
                this.rules.push(rule2)
            }
            else {
                this.rules = []
            }
        },
    },
    mounted() {
        for (var item of this.items) {
            item.FileSchema = item.FileSchema.replaceAll('[', "")
            item.FileSchema = item.FileSchema.replaceAll(']', "")
            item.FileSchema = item.FileSchema.replaceAll('"', "")
            item.FileSchema = item.FileSchema.split(",")
            item.Key_Fields = item.Key_Fields.replaceAll('[', "")
            item.Key_Fields = item.Key_Fields.replaceAll(']', "")
            item.Key_Fields = item.Key_Fields.replaceAll('"', "")
            item.Key_Fields = item.Key_Fields.split(",")
        }
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
