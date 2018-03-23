import Bus from "../bus"

module.exports="compo"
  
Vue.component('vue-koulutukset',{
    template: `
    <div>
        <div style="display: flex">
            <div style="flex: 1; font-weight: bold">Pvm</div>
            <div style="flex: 1; font-weight: bold">Tilaisuus</div>
            <div style="flex: 1; font-weight: bold">Kouluttaja</div>
            <div style="flex: 0.4; font-weight: bold">Osallistujia</div>
            <div style="flex: 1; font-weight: bold">Tools</div>
        </div>
        <div v-for="koulutus in koulutukset" style="display: flex" :key="koulutus.id">
            <div style="flex: 1">{{koulutus.pvm}}</div>
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

    props: ['koulutukset', 'filters', 'read_only'], 
    data: function(){
        return {
            //koul: this.koulutukset,
            //filt: this.filters
        }
    },
    methods: {
        edit(koulutus){
            Bus.emit(Bus.EDIT_KOULUTUS, koulutus);
        }
    }
});
