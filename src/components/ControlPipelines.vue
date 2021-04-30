<template>
    <v-container>
        <v-container class="container-with-margin">
            <v-row>
                <v-btn elevation="2" @click="uploadFile()">Import File</v-btn>
                <v-spacer></v-spacer>
                <v-btn elevation="2" @click="resetFile()" v-if="file.length!=0">Reset File</v-btn>
            </v-row>
            <v-file-input
            v-model="file"
            prepend-icon=""
            accept=".json"
            class="hide"
            id="inputFile"
            @change="readFile"
            ></v-file-input>

            <v-card class="fileAttributes">
                <v-card-title>{{ fileName }}</v-card-title>
                <v-card-text>
                <v-row class="inputRow">
                    <v-col class="inputCol">
                        <v-label class="label">PE House</v-label>
                        <v-text-field class="input" v-model="file['PE House']" solo-inverted :disabled="disabled"></v-text-field>
                    </v-col>
                    <v-col  class="inputCol">
                        <v-label class="label">PE House ID</v-label>
                        <v-text-field class="input" v-model="file['pehouseid']" solo-inverted :disabled="disabled"></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="inputRow">
                    <v-col class="inputCol">
                        <v-label class="label">Comment</v-label>
                        <v-text-field class="input" v-model="file['_comment']" solo-inverted :disabled="disabled"></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="inputRow">
                    <v-col class="inputCol">
                        <v-label class="label">Load</v-label>
                        <v-btn block class="editBtn" @click="editLoad()" :disabled="disabled">Edit</v-btn>
                    </v-col>
                    <v-col  class="inputCol">
                        <v-label class="label">Download</v-label>
                        <v-btn block class="editBtn" @click="edit='Download'" :disabled="disabled">Edit</v-btn>
                    </v-col>
                </v-row>
                </v-card-text>
            </v-card>
        </v-container>
        
        <load v-if="edit==='Load'" :myFile="file['Load']" ref="loadVue"></load>

        <v-row>
            <v-spacer></v-spacer>
            <v-btn elevation="2" @click="writeFile" v-if="file.length!=0">Save as new file</v-btn>
        </v-row>

    </v-container>

    
</template>

<script>
import Load from './Load'

export default {
    components: {
        Load
    },
    data: () => ({
        fileName: '',
        originalFile: '',
        attributes: ['PE House', 'pehouseid', '_comment', 'Load', 'Download'],
        file: [],
        edit: '',
    }),
    computed: {
        disabled() {
            if (this.file.length == 0) {
                return true
            }
            else {
                return false
            }
        }
    },
    methods: {
        readFile(file) {
            this.asyncReadFile(file).then(result => {
                this.fileName = file.name
                var data = JSON.parse(result)
                this.file = data
                this.originalFile = Object.assign({}, this.file)
                if (!!this.$refs.loadVue) {
                    this.edit = ''
                }
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
        uploadFile() {
            document.getElementById("inputFile").click()
        },
        resetFile() {
            this.file = Object.assign({}, this.originalFile)
        },
        writeFile() {
            if (this.$refs.loadVue) {
                var load = this.$refs.loadVue.saveLoad()
                this.file.Load = load
            }
            this.originalFile = Object.assign({}, this.file)
            var saveFile = JSON.stringify(this.file, null, "\t")
            var fileSaver = require('file-saver')
            var blob = new Blob([saveFile], {type: "application/json"})
            fileSaver.saveAs(blob, "control_pipelines.json")
            
        },
        editLoad() {
            this.edit = 'Load'
            if (this.$refs.loadVue) {
                this.$refs.loadVue.populateTable()
            }
        }
    }
}
</script>

<style>
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

    .container-with-margin {
        margin-top: 64px!important;
    }
    .fileAttributes{
        padding: 1em!important;
    }
    .fileAttributes .label {
        font-size: 1.1em;
        display: inline-block;
        padding-bottom: 0.5em;
    }
    .fileAttributes .v-input--is-focused .v-input__slot {
        background-color: #CFD8DC!important;
        
    }
    .fileAttributes .v-input--is-focused .v-input__control .v-input__slot input {
        color: black!important;
        caret-color: black!important;
    }
    .fileAttributes .editBtn {
        margin: inherit;
    }
    
</style>