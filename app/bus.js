var bus = new Vue({
    methods: {
        on: function(event, callback){
            this.$on(event, callback);
        },
        emit: function(event, payload){
            this.$emit(event, payload);
        }
    }
});

const SNACKBAR="SNACKBAR";
const UPDATE_GRID= "UPDATE_GRID";
const DOC_SAVED= "DOC SAVED";
const EDIT_KOULUTUS= "EDIT KOULUTUS";
const LINK_CLICK= "LINK CLICK";

function snackbar(message){
    console.log(message);
    bus.emit(SNACKBAR, message);
}

module.exports = {
    bus: bus,
    UPDATE_GRID,
    DOC_SAVED,
    SNACKBAR,
    EDIT_KOULUTUS,
    LINK_CLICK,
    on: function(event, callback){ bus.on(event, callback)},
    emit: function(event, payload){ bus.emit(event, payload)},
    snackbar: snackbar,
}