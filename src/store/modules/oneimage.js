
const useGqOneImageStore = defineStore('oneimage', {
    state: () => ({
        checkboxs:['RR-水库水情-shuiweizhan'],
        MapLayer:null,
        legend:2,
        toolBar:7,
        realtimePoint:[],
        buildLayers:[],
        conservancy:['outer-灌区边界-layer','main-总干渠-layer','trunk-干渠-layer','tributary-支渠-layer','wySurface-王英水库@面-layer','cxSurface-蔡贤水库@面-layer'],
        conservancyPoint:[],
        initSite:false,
    }),
    actions: {
        getLegendPositioning(pos){
            this.legend = pos;
        },
        getToolBarPositioning(pos){
            this.toolBar = pos;
        },
        getCheckBoxs(list){
            this.checkboxs = list;
        },
        getMap(map){
            this.MapLayer = map;
        },
        getConservancy(cos){
            this.conservancy = cos;
        },
        getRealtimePoint(points){
            if(points.length){
                this.realtimePoint = this.realtimePoint.concat(points);
            }else{
                this.realtimePoint = [];
            }
        },
        getBuildLayers(layers){
            if(layers.length){
                this.buildLayers = this.buildLayers.concat(layers);
            }else{
                this.buildLayers = [];
            }
        },
        getConservancyPoint(points){
            if(points.length){
                this.conservancyPoint = this.conservancyPoint.concat(points);
            }else{
                this.conservancyPoint = [];
            }
        },
    }
})

export default useGqOneImageStore
