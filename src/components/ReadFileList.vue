<template>
    <v-container>
        <v-btn elevation="2">Import File</v-btn>
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
                        <td @click="clicked(item, 'Fileroot')">{{ item.Fileroot }}</td>
                        <td @click="clicked(item, 'Action')">{{ item.Action }}</td>
                        <td @click="clicked(item, 'Schema')">{{ item.Schema.toString().slice(0,50) }}</td>
                        <td @click="clicked(item, 'DataType')">{{ item.DataType.toString().slice(0,50) }}</td>
                        <td @click="clicked(item, 'Table')">{{ item.Table }}</td>
                        <td @click="clicked(item, 'Primary_Key')">{{ item.Primary_Key }}</td>
                        <td @click="clicked(item, 'Hash_Keys')">{{ item.Hash_Keys.toString().slice(0,50) }}</td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>

        <v-btn elevation="2" @click="newRecord">Create New Record</v-btn>



        <v-dialog v-model="dialog" width="500">
            <v-card>
                <v-card-title>
                    Edit {{editAttribute}}
                </v-card-title>
                <v-card-text>
                    <v-textarea v-if="showBigInput"
                    v-model="editedItem[editAttribute]"
                    auto-grow
                    autofocus
                    rows="1"
                    ></v-textarea>
                    <v-text-field v-else v-model="editedItem[editAttribute]"></v-text-field>
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
        myFile: filelist,
        reRender: 0,
        dialog: false,
        itemsPerPage: 10,
        page: 1,
        pageCount: 1,
        itemToEdit: '',
        editedItem: '',
        editAttribute: '',
        showBigInput: false,
        headers: [
            { text:'File Root', value: 'Fileroot'},
            { text:'Action', value: 'Action'},
            { text:'Schema', value: 'Schema', width: '1%'},
            { text:'Data Type', value: 'DataType'},
            { text:'Table', value: 'Table'},
            { text:'Primary Key', value: 'Primary_Key'},
            { text:'Hash Keys', value: 'Hash_Keys'},
        ],
        items: [],
    }),
    methods: {
        readFile(file) {
            for (var item of file) {
                var d = {}
                for (var header of this.headers) {
                    d[header['value']] = item[header['value']]
                }
                this.items.push(d)
            }
        },
        forceRenderer() {
            this.reRender += 1
        },
        clicked(item, attribute) {
            console.log("Clicked")
            this.dialog = true
            this.itemToEdit = item
            this.editedItem = Object.assign({}, this.itemToEdit)
            this.editAttribute = attribute
            if (this.editAttribute == 'Schema' || this.editAttribute == 'DataType' || this.editAttribute == 'Hash_Keys') {
                this.showBigInput = true
            }
            else {
                this.showBigInput = false
            }
            console.log(item)
            console.log(this.itemsPerPage)
        },
        saveAttribute() {
            this.dialog = false
            if (this.editAttribute == 'Schema' || this.editAttribute == 'DataType' || this.editAttribute == 'Hash_Keys') {
                this.editedItem[this.editAttribute] = (this.editedItem[this.editAttribute]).split(",")
            }
            for (var i of this.items) {
                if (i == this.itemToEdit) {
                    this.items[this.items.indexOf(i)] = this.editedItem
                    
                }
            }
            if (this.editAttribute == 'Schema' || this.editAttribute == 'DataType' || this.editAttribute == 'Hash_Keys') {}
            console.log(this.items)
            this.forceRenderer()
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
            this.page = this.pageCount
        },
        paginate(val) {
            this.page = val.page
            this.itemsPerPage = val.itemsPerPage
            this.pageCount = val.pageCount
        }
    },
    mounted() {
        this.readFile(this.myFile)
    }
}
</script>

<style>
    .v-btn {
        margin: 1em;
    }
</style>
