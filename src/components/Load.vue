<template>
    <v-container>
        <v-row>
            <v-btn elevation="2" @click="newRecord">Create New Record</v-btn>
            <v-spacer></v-spacer>
            <v-btn elevation="2" @click="resetFile()">Reset Load</v-btn>
        </v-row>

        <v-card>
            <v-card-title>
                Load
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
                            <td @click="clicked(item, 'PortcoPipeline', false)">{{ displayList(item.PortcoPipeline) }}</td>
                            <td @click="clicked(item, 'PreStoredProcedures', false)">{{ displayList(item.PreStoredProcedures) }}</td>
                            <td @click="clicked(item, 'PostStoredProcedures', false)">{{ displayList(item.PostStoredProcedures) }}</td>
                            <td @click="clicked(item, 'ExpectedFiles', false)">Click here to edit</td>
                        </tr>
                    </tbody>
                </template>
                
            </v-data-table>
        </v-card>


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
        <expected-files v-if="showExpectedFiles" :portcos="items" :portcoToEdit="itemToEdit" ref="expectedFilesVue"></expected-files>
    </v-container>

    
    
</template>

<script>
import ExpectedFiles from './ExpectedFiles.vue'
//import store from '../router/index'

export default {
    name: 'ControlPipelines',
    components: {
        ExpectedFiles
    },
    props: ['myFile'],
    data: () => ({
        items: [],
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
        showExpectedFiles: false,
        showBigInput: false,
        persistentDialog: false,
        headers: [
            { text:'Portco ID', value: 'PortcoID'},
            { text:'SFTP Directory', value: 'SFTPDirectory'},
            { text:'Portco Pipeline', value: 'PortcoPipeline'},
            { text:'Pre-stored Procedures', value: 'PreStoredProcedures'},
            { text:'Post-stored Procedures', value: 'PostStoredProcedures'},
            { text:'Expected Files', value: 'ExpectedFiles'}
        ],
        listHeaders: ['PortcoPipeline', 'PreStoredProcedures', 'PostStoredProcedures'],
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
        saveLoad() {
            var portcos = []
            for (var item of this.items) {
                for (var header of this.listHeaders) {
                    //convert to arrays
                    item[header] = item[header].split(", ")
                }
                //stringify expected files
                if (this.$refs.expectedFilesVue) {
                    var id = item['PortcoID']
                    var EFItems = this.$refs.expectedFilesVue.saveExpectedFiles()
                    var EFs = (EFItems.find(p => p['PortcoID'] === id))['ExpectedFiles']
                    var EFHeaders = ["FileSchema", "Key_Fields"]
                    for (var expectedFile of EFs) {
                        for(var EFHeader of EFHeaders) {
                            var listToConvert = expectedFile[EFHeader]
                            if(listToConvert === "") {
                                listToConvert = "[]"
                            }
                            else {
                                listToConvert = listToConvert.split(", ")
                                listToConvert = JSON.stringify(listToConvert)
                            }
                            expectedFile[EFHeader] = listToConvert
                        }
                    }
                    item['ExpectedFiles'] = EFs
                }
                this.myFile[item.PortcoID] = item
                portcos.push(item.PortcoID)
            }
            //make sure deleted portcos are also deleted from myFile
            var otherKeys = ["Execute", "TriggerPipeline", "Portcos"]
            for (var i of Object.keys(this.myFile)) {
                if (!portcos.includes(i) && !otherKeys.includes(i)) {
                    delete this.myFile[i]
                }
            }
            this.myFile.Portcos = portcos
            this.populateTable()
            this.showExpectedFiles = false
            return this.myFile
        },
        forceRenderer() {
            this.reRender += 1
        },
        displayList(listToDisplay) {
            if (listToDisplay.length > 40){
                listToDisplay = listToDisplay.slice(0,listToDisplay.indexOf(" ", 40)).concat(" ...")
            }
            return listToDisplay
        }, 
        clicked(item, attribute, persistent) {
            this.persistentDialog = persistent
            this.itemToEdit = item
            this.editedItem = Object.assign({}, this.itemToEdit)
            this.editAttribute = attribute
            if(this.editAttribute === 'ExpectedFiles') {
                if (this.$refs.expectedFilesVue) {
                    this.$refs.expectedFilesVue.changePortcoToEdit(this.itemToEdit)
                }
                else {
                    this.showExpectedFiles = true
                }
                return
            }
            if (this.listHeaders.includes(this.editAttribute)) {
                this.showBigInput = true
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
            newItem['ExpectedFiles'] = []
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
        resetFile() {
           this.populateTable()
        },
        deleteSelected() {
            var newItems = []
            for (var item of this.items) {
                if (!this.selected.includes(item.PortcoID)) {
                    newItems.push(item)
                }
            }
            this.items = []
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
                const rule2 = value => (this.itemToEdit['PortcoID'] === value) || (portcoIDs.indexOf(value) == -1) || 'Duplicate PortcoID'
                this.rules.push(rule2)
            }
            else {
                this.rules = []
            }
        },
        populateTable() {
            this.portcoIDs = this.myFile['Portcos']
            this.items = []
            for (var portcoID of this.portcoIDs) {
                var item = Object.assign({}, this.myFile[portcoID])
                for (var header of this.listHeaders) {
                    item[header] = item[header].join(", ")
                }
                this.items.push(item)
            }
            this.forceRenderer()
            this.page = 1 
        },
    },
    mounted() {
        this.populateTable()
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
