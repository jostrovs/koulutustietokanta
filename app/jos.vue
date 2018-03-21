<template>
    <p>Hello, {{you}}!</p>
</template>

<script>
module.exports = {
    props: ['arg'],
    data: function(){
        let messu = "a" + this.arg + "b";
        return {
            you: messu,
        }
    }
}
</script>

<style scoped>
    p {
        border: 1px solid red;
    }
</style>