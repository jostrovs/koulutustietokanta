import Bus from "../bus"

module.exports="compo"
  
Vue.component('vue-koulutukset',{
    template: `
    <div id="vue-koulutukset">
        <div>Level: {{userLevel}} </div>
        <div>Osallistujia yhteensä: {{total}}</div>
        <div style="display: flex">
            <div style="flex: 0.3; font-weight: bold; display: flex" @click="sortByKey('pvm')">Pvm <i class="material-icons">{{sort.pvm | icon_filter}}</i></div>
            <div style="flex: 1; font-weight: bold; display: flex" @click="sortByKey('tilaisuus')">Tilaisuus <i class="material-icons">{{sort.tilaisuus | icon_filter}}</i></div>
            <div style="flex: 1; font-weight: bold; display: flex" @click="sortByKey('kouluttaja')">Kouluttaja <i class="material-icons">{{sort.kouluttaja | icon_filter}}</i></div>
            <div style="flex: 0.4; font-weight: bold; display: flex" @click="sortByKey('osall')">Osallistujia <i class="material-icons">{{sort.osall | icon_filter}}</i></div>
            <div style="flex: 1; font-weight: bold" v-if="userLevel>0">Tools</div>
        </div>
        <div style="display: flex">
            <div style="flex: 0.3;"><input v-model="filters.pvm"></div>
            <div style="flex: 1;"><input v-model="filters.tilaisuus"></div>
            <div style="flex: 1;"><input v-model="filters.kouluttaja"></div>
            <div style="flex: 0.4;"></div>
            <div style="flex: 1;" v-if="userLevel>0"></div>
        </div>
        <div v-for="koulutus in sorted" style="display: flex" :key="koulutus.id">
            <div style="flex: 0.3">{{koulutus.pvm}}</div>
            <div style="flex: 1">{{koulutus.tilaisuus}}</div>
            <div style="flex: 1">{{koulutus.kouluttaja}}</div>
            <div style="flex: 0.4">{{koulutus.osallLkm()}}</div>
            <div style="flex: 1" v-if="userLevel>0">
                <v-tooltip right>
                    <v-icon slot="activator" color="primary" style="cursor: pointer" v-if="!read_only" @click.stop="edit(koulutus)">mode_edit</v-icon>
                    <span>Muokkaa</span>
                </v-tooltip>
            </div>
        </div>
    </div>
    `,

    props: ['data', 'filters'], 
    data: function(){
        return {
            koulutukset: this.data.koulutukset,
            read_only: this.data.read_only,
            total: 0,
            sort: {
                key: "",
                pvm: 0,
                tilaisuus: 0,
                kouluttaja: 0,
                osall: 0,
            },
        }
    },
    methods: {
        edit(koulutus){
            Bus.emit(Bus.EDIT_KOULUTUS, koulutus);
        },

        sortByKey(key){
            this.sort.key = key;
            if(this.sort[key] < 0) this.sort[key] = 1;
            else if(this.sort[key] > 0) this.sort[key] = 0;
            else this.sort[key] = -1;

            for(let k in this.sort){
                if(k != key && k != "key") this.sort[k] = 0;
            }
        },

        filtered(){
            let self=this;

            let ret = this.koulutukset.map(i=>i);
            
            for(let key in this.sort){
                let needle = self.filters[key];
                if(needle){
                    needle = needle.toLowerCase();
                    ret = ret.filter(it=>{
                        let haystack = it[key] ? it[key] : "";
                        return haystack.toLowerCase().indexOf(needle) >= 0;
                    });
                }
            }

            let tot=0;
            ret.map(it =>{ 
                tot += it.osallLkm()
            });
            self.total=tot;
            
            return ret;
        },

    },
    computed: {
        sorted(){
            let self=this;

            let ret = this.filtered();

            let key = this.sort.key;
            let direction = this.sort[key];
            
            if(!key || !direction) return ret;

            let sorted = ret.sort((a,b)=> {
                let v1 = a[key];
                let v2 = b[key];

                if(key == "osall"){
                    v1 = a.osallLkm();
                    v2 = b.osallLkm();
                } 

                let r = 0;
                if(v1 < v2) r=-1;
                if(v1 > v2) r=1;

                return direction*r;
            });

            return sorted;
        },

        userLevel(){
            return this.data.userLevel();
        }
    },
    filters: {
        icon_filter: function(val){
            if(val == 0) return "";
            if(val > 0) return "arrow_drop_up";
            if(val < 0) return "arrow_drop_down";
        }
    }
});
