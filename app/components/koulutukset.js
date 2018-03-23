import Bus from "../bus"

module.exports="compo"
  
Vue.component('vue-koulutukset',{
    template: `
    <div id="vue-koulutukset">
        <div>Osallistujia yhteensä: {{total}}</div>
        <div style="display: flex">
            <div style="flex: 0.3; font-weight: bold" @click="sortPvm">Pvm {{sort.pvm}}</div>
            <div style="flex: 1; font-weight: bold" @click="sortTilaisuus">Tilaisuus {{sort.tilaisuus}}</div>
            <div style="flex: 1; font-weight: bold" @click="sortKouluttaja">Kouluttaja  {{sort.kouluttaja}}</div>
            <div style="flex: 0.4; font-weight: bold">Osallistujia</div>
            <div style="flex: 1; font-weight: bold">Tools</div>
        </div>
        <div style="display: flex">
            <div style="flex: 0.3;"><input v-model="filters.pvm"></div>
            <div style="flex: 1;"><input v-model="filters.tilaisuus"></div>
            <div style="flex: 1;"><input v-model="filters.kouluttaja"></div>
            <div style="flex: 0.4;"></div>
            <div style="flex: 1;"></div>
        </div>
        <div v-for="koulutus in sorted" style="display: flex" :key="koulutus.id">
            <div style="flex: 0.3">{{koulutus.pvm}}</div>
            <div style="flex: 1">{{koulutus.tilaisuus}}</div>
            <div style="flex: 1">{{koulutus.kouluttaja}}</div>
            <div style="flex: 0.4">{{koulutus.osallLkm()}}</div>
            <div style="flex: 1">
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
                pvm: 0,
                tilaisuus: 0,
                kouluttaja: 0,
            }
        }
    },
    methods: {
        edit(koulutus){
            Bus.emit(Bus.EDIT_KOULUTUS, koulutus);
        },

        sortPvm(){
            if(this.sort.pvm < 0) this.sort.pvm = 1;
            else if(this.sort.pvm > 0) this.sort.pvm = 0;
            else this.sort.pvm = -1;
        },
        sortTilaisuus(){
            if(this.sort.tilaisuus < 0) this.sort.tilaisuus = 1;
            else if(this.sort.tilaisuus > 0) this.sort.tilaisuus = 0;
            else this.sort.tilaisuus = -1;
        },
        sortKouluttaja(){
            if(this.sort.kouluttaja < 0) this.sort.kouluttaja = 1;
            else if(this.sort.kouluttaja > 0) this.sort.kouluttaja = 0;
            else this.sort.kouluttaja = -1;
        },

        sortFunc(a,b){
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        },

        filtered(){
            let self=this;

            let ret = this.koulutukset.map(i=>i);
            if(self.filters.pvm) ret = ret.filter(it=>it.pvm.indexOf(self.filters.pvm)>=0);
            if(self.filters.tilaisuus) ret = ret.filter(it=>it.tilaisuus.indexOf(self.filters.tilaisuus)>=0);
            if(self.filters.kouluttaja) ret = ret.filter(it=>it.kouluttaja.indexOf(self.filters.kouluttaja)>=0);

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

            if(this.sort.pvm != 0){
                return ret.sort((a,b)=>self.sortFunc(a.pvm, b.pvm));
            }
            if(this.sort.tilaisuus != 0){
                return ret.sort((a,b)=>self.sortFunc(a.tilaisuus, b.tilaisuus));
            }
            if(this.sort.kouluttaja != 0){
                return ret.sort((a,b)=>self.sortFunc(a.kouluttaja, b.kouluttaja));
            }

            return ret;
        }
    }
});
