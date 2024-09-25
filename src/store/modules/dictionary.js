const useDictionaryStore = defineStore('dictionary', {
        state: () => ({
            dictionary: {}
        }),
        actions: {
            // 获取字典
            getDict(_key) {
                for (const k in this.dictionary) {
                    if(k === _key){
                        return this.dictionary[_key]
                    }
                }
            },
            // 设置字典
            setDict(dic) {
                this.dictionary = dic;
            },
            // 清空字典
            cleanDict() {
                this.dictionary = {}
            },
            // 初始字典
            initDict() {
            }
        }
    })

export default useDictionaryStore
