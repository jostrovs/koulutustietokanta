import moment from "moment"

module.exports="compo";

Vue.component('vue-jos-grid', {
    template: `
    <div class="jos-table-container" style="padding: 0px;">   

    <input v-if="options.generalFilter" style="margin-top: 16px; border: 1px solid #eee;" type="text" v-model="general_filter" placeholder="Hae">
    <table :class="options.luokka" id="jos-grid" style="cursor: pointer;">                                                                               
        <thead>                                                                                                   
            <tr>                                                                                                  
                <th v-for="column in shownColumns" :class="{active: sortCol == column.key}" :width="column.width">
                    <span @click="column.sortable != false && sortBy(column.key)">{{column.title}}</span>         
                    <span v-if="sortIndicators[column.key]==1" class="material-icons" style="font-size: 15px">arrow_downward</span>                                          
                    <span v-if="sortIndicators[column.key]==-1" class="material-icons" style="font-size: 15x">arrow_upward</span>                                       

                    <i v-if="column.isLast" style="float: right" class="glyphicon glyphicon-filter" @click="toggleColumnFilters()" title="Sarakekohtaiset suodattimet päälle/pois" />                                                                                  
                    
                    <template v-if="columnFilters && column.filterable != false">                                                  
                        <br><input style="width: 80%;" type="text" v-model="filters[column.key]">                 
                    </template> 
                </th>                                                                                             
            </tr>                                                                                                 
        </thead>                                                                                                  
        <tbody>                                                                                                   
            <tr v-for="entry in filteredSortedData" :key="entry.josOrder" @click="rowClick(entry)">            
                <td v-for="column in shownColumns">                                                               
                    <div v-if="column.template && !column.onClick" style="display: inline-block" v-html="entry[column.key]"></div>
                    <div v-else-if="column.link_click" style="display: inline-block" v-html="entry[column.name]" @click="column.onClick(entry)">
                    </div>
                    <template v-else>
                        <template v-if="column.type == \'text\'">                                                     
                            {{entry[column.key]}}                                                                     
                        </template>                                                                                   
                        <template v-if="column.type == \'number\'">                                                   
                            {{entry[column.key]}}                                                                                          
                        </template>                                                                                    
                        <template v-if="column.type == \'link\'">                                                     
                            <a :href="entry[column.key].href">{{entry[column.key].text}}</a>                          
                        </template>                                                                                   
                        <template v-if="column.type == \'date\'">                                                     
                            {{formatDate(entry[column.key])}}
                        </template>                                                                                   
                    </template>
                </td>                                                                                             
            </tr>                                                                                                 
        </tbody>                                                                                                  
    </table>                                                                                                      
    </div>                
    `,
    props: ['data', 'options'],

    // columnSetting:
    // {
    //     title: "Pitkä nimi",
    //     key: "nimi",
    //     type: text / number / date / jotain ihan muuta
    // }

    data: function () {
        let self = this;
        let localData = [];
        this.options.luokka = {
            'table': false,
            'table-striped': false,
            'table-bordered': false,
            'table-hover': false,
            'table-condensed': false,

            'jos-table': true,
        };
        
        let columns = [];
        let filters = {};
        let sortIndicators = {};
        let cnt = 1;
        if(this.options && this.options.columns){
            this.options.columns.forEach(function (column) {
                let localColumn = column;
                localColumn.josSortOrder=0;
                if(column.type == undefined) localColumn.type = "text";
                if(column.name == undefined) localColumn.name = column.key;
                columns.push(localColumn);
                sortIndicators[column.key]=0;
                localColumn.isLast = (cnt++ == self.options.columns.length-1);
            });
        }

        let c=1;
        if(this.data){
            this.data.forEach(function(item){
                item['josOrder'] = c++;

                self.options.columns.forEach(function (column) {
                    if(column.template != undefined){
                        if(column.key) item[column.key] = column.template(item);
                        else if(column.name) item[column.name] = column.template(item);
                    }
                });
                localData.push(item);
            });
        }

        let sortKey = '';
        if(this.options.initialSort){
            sortIndicators[this.options.initialSort.key] = this.options.initialSort.order; //sortIndicators['pvm']=-1;
            sortKey = this.options.initialSort.key;
        }

        let columnFilters = this.options.columnFilters;
        if(localStorage.josGridColumnFilters) columnFilters = localStorage.josGridColumnFilters;
        if(typeof(columnFilters) === 'undefined') columnFilters = false;

        return {
            columnFilters: columnFilters,
            menu: false,
            general_filter: "",
            localData: localData,
            sortCol:  sortKey,
            sortOrder: -1,
            columns: columns,
            sortIndicators: sortIndicators,
            filters: filters,
        }
    },

    created: function(){
        if(this.options.onCreated) this.options.onCreated(this);

        if(this.options.columnFilters != true) this.options.columnFilters = false;
        if(this.options.generalFilter != true) this.options.generalFilter = false;
    },

    computed: {
        shownColumns: function(){
            return this.columns.filter(function(item){ return item.hidden != true});
        },
        
        filteredSortedData: function(){
            let self = this;
            let ret = this.localData;
            
            if(this.options.externalFilters){
                for(let extFilt of this.options.externalFilters){
                    ret = extFilt(ret);
                }
            }

            for(let i=0;i<this.columns.length;++i){
                let column = this.columns[i];
                ret = this.filterByColumn(column, ret);
            }

            for(let i=0;i<this.columns.length;++i){
                let column = this.columns[i];
                if(column.name == this.sortCol){
                    if(this.sortOrder == 0){
                        ret = ret.sort(function(a,b){
                            return a.josOrder-b.josOrder;
                        });
                    } else {
                        ret = ret.sort(function(a,b){
                            let r = 0;
                            let v1 = self.getVal(column, a[column.key]);
                            let v2 = self.getVal(column, b[column.key]); 

                            if(v1 < v2) r=-1;    
                            else if(v1 > v2) r=1;
                            return r*self.sortOrder;
                        });    
                    }
                }
            }

            ret = this.generalFilter(ret);

            return ret;
        },
    },
    methods: {
        toggleColumnFilters(){
            this.columnFilters = !this.columnFilters;
            
            localStorage.josGridColumnFilters = this.columnFilters;
        },
        
        rowClick: function(row_item){
            if(this.options.onRowClick) this.options.onRowClick(row_item);
        },
        
        setData: function(data){
            let self=this;
            let localData = [];
            let c=1;
            if(data){
                data.forEach(function(item){
                    let ni = {};
                    ni['josOrder'] = c++;
    
                    var col = 0;
                    self.options.columns.forEach(function (column) {
                        if(column.template != undefined){
                            ni[column.key] = column.template(item);
                        } else {
                            ni[column.key] = item[column.key];
                        }
                    });
                    localData.push(ni);
                });
            }
    
            self.localData = localData;
        },
        
        sortBy: function (key) {
            this.sortIndicators = {};
            if(this.sortCol != key){
                this.sortCol = key;
                this.sortOrder = 1;
            } else {
                if(this.sortOrder == 1) this.sortOrder = -1;
                else if(this.sortOrder == -1) this.sortOrder = 0;
                else if(this.sortOrder == 0) this.sortOrder = 1;
            }
            this.sortIndicators[key] = this.sortOrder;
        },
        getVal: function(column, entry){
            if(entry == null || entry == undefined) entry = "";
            if(column.type == 'link') return entry.text.toLowerCase();
            return entry.toLowerCase();
        },
        filterByColumn: function(column, data){
            let self=this;
            let filter = this.filters[column.key];
            if(filter == undefined || filter.length < 1) return data;
            filter = filter.toLowerCase();
            let ret = data; 
          
            ret = ret.filter(function(item){
                let val = self.getVal(column, item[column.key]);
                if(val == undefined) val = "";
                val=val.toString().toLowerCase();
                return val.indexOf(filter) > -1;
            });
            return ret;
        },
        generalFilter: function(data){
            if(this.general_filter.length < 1) return data;

            let self=this;
            let filter = this.general_filter.toLowerCase();
            let ret = data; 
          
            ret = ret.filter(function(item){
                let accept=false;
                for(let col of self.columns){
                    if(col.hidden) continue;
                    let val = self.getVal(col, item[col.key]);
                    val = val.toString().toLowerCase();
                    if(val.indexOf(filter) > -1){
                        accept=true;
                        break;
                    }
                }
                return accept;
            });
            return ret;
        },
        formatDate: function(string){
            return moment(string).format("DD.MM.YYYY");
        }
    },
});

