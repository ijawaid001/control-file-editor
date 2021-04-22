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
                        <tr v-for="item in items" :key="item.PortcoID">
                            <td><v-checkbox :value="item.PortcoID" v-model="selected"></v-checkbox></td>
                            <td @click="clicked(item, 'PortcoID', false)">{{ item.PortcoID }}</td>
                            <td @click="clicked(item, 'SFTPDirectory', false)">{{ item.SFTPDirectory }}</td>
                            <td @click="clicked(item, 'PortcoPipeline', false)">{{ displayList(item.PortcoPipeline, 'PortcoPipeline') }}</td>
                            <td @click="clicked(item, 'PreStoredProcedures', false)">{{ displayList(item.PreStoredProcedures, 'PreStoredProcedures') }}</td>
                            <td @click="clicked(item, 'PostStoredProcedures', false)">{{ displayList(item.PostStoredProcedures, 'PostStoredProcedures') }}</td>
                            <td @click="clicked(item, 'ExpectedFiles', false)">{{ displayList(item.ExpectedFiles, 'ExpectedFiles') }}</td>
                        </tr>
                    </tbody>
                </template>
                
            </v-data-table>
        </v-card>

        <v-row>
            <v-btn elevation="2" @click="newRecord">Create New Record</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="!(!!expectedFiles.length)" elevation="2" @click="writeFile">Save as new file</v-btn>
        </v-row>


        <v-dialog v-model="dialog" width="500" v-bind:persistent="persistentDialog">
            <v-card>
                <v-card-title>
                    Edit {{this.editAttribute}}
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
        <expected-files v-if="!!expectedFiles.length" :items="expectedFiles"></expected-files>
    </v-container>

    
    
</template>

<script>
import ExpectedFiles from './ExpectedFiles.vue'

export default {
    name: 'ControlPipelines',
    components: {
        ExpectedFiles
    },
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
        expectedFiles: [],
        showBigInput: false,
        persistentDialog: false,
        headers: [
            { text:'Portco ID', value: 'PortcoID'},
            { text:'SFTP Directory', value: 'SFTPDirectory'},
            { text:'Portco Pipeline', value: 'PortcoPipeline'},
            { text:'Pre-stored Procedures', value: 'PreStoredProcedures'},
            { text:'Post-stored Procedures', value: 'PostStoredProcedures'},
            { text:'Expected Files', value: 'ExpectedFiles', width: '50%'}
        ],
        listHeaders: ['PortcoPipeline', 'PreStoredProcedures', 'PostStoredProcedures', 'ExpectedFiles'],
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
        }
    },
    methods: {
        readFile(file) {
            this.asyncReadFile(file).then(result => {
                this.fileName = file.name
                var data = JSON.parse(result)
                this.portcoIDs = data['Load']['Portcos']
                this.items = []
                this.myFile = []
                for (var portcoID of this.portcoIDs) {
                    this.items.push(data['Load'][portcoID])
                    this.myFile.push(data['Load'][portcoID])
                }
                console.log(this.myFile)
                this.forceRenderer()
                this.page = 1 
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
            if(attribute === 'ExpectedFiles') {
                var fileRoots = []
                for (var file of listToDisplay) {
                    fileRoots.push(file.FileRoot)
                }
                listToDisplay = fileRoots
                listToDisplay = listToDisplay.join(", ").slice(0,listToDisplay.join(", ").indexOf(" ", 100))
            }
            else {
                if (listToDisplay.length = 1) {
                    listToDisplay = listToDisplay.join(",")
                }
                else {
                    listToDisplay = listToDisplay.join(", ").slice(0,listToDisplay.join(", ").indexOf(" ", 40))
                }
            }
            return listToDisplay
        },
        clicked(item, attribute, persistent) {
            this.persistentDialog = persistent
            this.itemToEdit = item
            this.editedItem = Object.assign({}, this.itemToEdit)
            this.editAttribute = attribute
            if(this.editAttribute === 'ExpectedFiles') {
                this.expectedFiles = this.itemToEdit['ExpectedFiles']
                console.log(this.expectedFiles)
                return
            }
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
                    newItem[header.value] = ['']
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
