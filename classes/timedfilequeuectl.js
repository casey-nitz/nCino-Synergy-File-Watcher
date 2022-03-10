const { is, errTracer } = require('./utilities')
const CLASSNAME = 'TimedFileQueueController';
const EventEmitter = require('events');
const fs = require('fs');

module.exports = (()=> {
    let _ = new WeakMap();
    class TimedFileQueueController extends EventEmitter{
        constructor( folderLocations, interval ){
            try{
                super();
                is( interval, 'number', 'interval' );
                let obj = {
                    objectQueues : {},
                    watchers : {}
                };
                _.set(this,obj);
                for( let i = 0; i < folderLocations.length; i++ ){
                    let loc = is(folderLocations[i],'string','folderLocations');
                    _.get(this).watchers[loc] = fs.watch(loc,(eventType,filename)=>{
                        if( filename ){
                            //console.log(`filename provided: ${filename},`,eventType);
                            _.get(this).objectQueues[loc].push(filename);
                        }
                    });
                    _.get(this).objectQueues[loc] = [];
                }
                setInterval(this._clearObjects.bind(this),interval)
            }catch(err){ errTracer( CLASSNAME,'constructor',err); }
        }
        _clearObjects(){
            try{
                let emitObj = {};
                for( let loc in _.get(this).objectQueues ){
                    emitObj[loc] = [... new Set(_.get(this).objectQueues[loc])];
                    _.get(this).objectQueues[loc] = [];
                }
                this.emit('files',emitObj);
            }catch(err){ errTracer( CLASSNAME, 'clearObjects',err); }
        }

    }
    return TimedFileQueueController;
})();