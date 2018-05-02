import moment from "moment"

var id=1;


class Osallistuja {
    constructor(obj=null){
     this.luokka = "Osallistuja";
        if(obj){
            this.id = obj.id;
            this.nimi = obj.nimi;
            this.postino = obj.postino;
            this.paikka = obj.paikka;
            this.vuosi = obj.vuosi;
            this.email = obj.email;
            this.huom = obj.huom;
            this.gdpr = obj.gdpr;

            this.koulutus_id = obj.koulutus_id,
            this.koulutus_title = obj.koulutus_title
        }

        if(this.id < 1) this.id = id++;
    }

    toFirebase(){
        let ret = {};
        ret.nimi = this.nimi ? this.nimi : "<puuttuu>";
        ret.postino = this.postino ? this.postino : "";
        ret.vuosi = this.vuosi ? this.vuosi : "";
        ret.paikka = this.paikka ? this.paikka : "";
        ret.email = this.email ? this.email : "";
        ret.huom = this.huom ? this.huom : "";
        ret.gdpr = this.gdpr ? true : false;
        
        return ret;
    }

    sensitize(){
        this.nimi = "<piilotettu>";
        this.email = "<piilotettu>";
        this.huom = "<piilotettu>";
    }
}

class Koulutus {
    constructor(obj=null){
        if(obj){
            this.uid = obj.uid;
            this.id = obj.id;
            this.kouluttaja = obj.kouluttaja;
            this.tilaisuus = obj.tilaisuus;            
            this.pvm = obj.pvm;            
            this.paikka = obj.paikka;            
            this.alue = obj.alue;            
            this.info = obj.info;
            this.lkm = obj.lkm;
            this.osallistujat=[];
            if(obj.osallistujat) obj.osallistujat.map(osall=>{
                this.osallistujat.push(new Osallistuja(osall));
            });
        }

        if(!this.osallistujat) this.osallistujat = [];

        if(!this.id) this.id = id++;

        if(this.pvm) this.moment = moment(this.pvm);

        if(!this.tilaisuus && !this.pvm){
            this.title = "<uusi koulutus>";
            this.isNew = true;
        } else {
            this.title = this.tilaisuus + " " + this.moment.format("DD.MM.YYYY");
        }
    }

    create(){
        this.osallistujat.push(new Osallistuja({id: id++}));
    }

    osallLkm(){
        if(this.lkm){
            if(this.lkm < this.osallistujat.length) return this.osallistujat.length;
            return this.lkm;
        }
        if(this.osallistujat.length > 0) return this.osallistujat.length;
        return 0;
    }

    toFirebase(){
        let ret = {};

        ret.kouluttaja = this.kouluttaja ? this.kouluttaja : "<puuttuu>";
        ret.tilaisuus = this.tilaisuus ? this.tilaisuus : "<puuttuu>";
        ret.pvm = this.pvm ? this.pvm : "1999.01.01";
        ret.paikka = this.paikka ? this.paikka : "";
        ret.alue = this.alue ? this.alue : "";
        ret.info = this.info ? this.info : "";
        ret.lkm = this.lkm ? this.lkm : this.osallistujat.length;

        ret.osallistujat = this.osallistujat.map(osall=>osall.toFirebase());

        return ret;
    }

    sensitize(){
        for(let i=0;i<this.osallistujat.length;++i){
            this.osallistujat[i].sensitize();
        }
        return this;
    }

    formattedDate(){
        if(!this.pvm) return "";
        let mome = moment(this.pvm);
        return mome.format("DD.MM.YYYY");
    }
}

module.exports = {
    Osallistuja: Osallistuja,
    Koulutus: Koulutus
}