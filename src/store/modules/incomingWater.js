const useIncomingWater = defineStore('incomingWater',{
    state: () => ({
        rainResult:{}
    }),
    actions:{
        getRainResult(ops){
            this.rainResult = ops;
        }
    }
})

export default useIncomingWater