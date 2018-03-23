import Bus from "../bus"

module.exports="compo"
  
Vue.component('vue-koulutukset',{
    template: `
    <div id="vue-koulutukset">
        <div>Osallistujia yhteensä: {{total}}</div>
        <div style="display: flex">
            <div style="flex: 0.3; font-weight: bold">Pvm</div>
            <div style="flex: 1; font-weight: bold">Tilaisuus</div>
            <div style="flex: 1; font-weight: bold">Kouluttaja</div>
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
        <div v-for="koulutus in filtered" style="display: flex" :key="koulutus.id">
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
        }
    },
    methods: {
        edit(koulutus){
            Bus.emit(Bus.EDIT_KOULUTUS, koulutus);
        }
    },
    computed: {
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
    }
});
