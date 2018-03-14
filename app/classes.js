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
        }

        if(this.id < 1) this.id = id++;
    }

    toFirebase(){
        let ret = {};
        ret.nimi = this.nimi ? this.nimi.toString() : "<puuttuu>";
        ret.postino = this.postino ? this.postino : "";
        ret.vuosi = this.vuosi ? this.vuosi : "";
        ret.paikka = this.paikka ? this.paikka : "";
        ret.email = this.email ? this.email : "";
        ret.huom = this.huom ? this.email : "";
        
        return ret;
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

        this.title = this.tilaisuus + "_" + this.pvm;
    }

    create(){
        this.osallistujat.push(new Osallistuja({id: id++}));
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
}

module.exports = {
    Osallistuja: Osallistuja,
    Koulutus: Koulutus
}