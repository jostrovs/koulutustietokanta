var id=1;


class Osallistuja {
    constructor(obj=null){
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
            this.osallistujat = obj.osallistujat;            
            if(this.osallistujat) this.osallistujat.map(osall=>{
                osall.id=id++;
            });
        }

        if(!this.id) this.id = id++;
    }
}