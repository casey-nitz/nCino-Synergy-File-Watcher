const { is, errTracer } = require('./utilities')
const CLASSNAME = 'TimedFileQueueController';
const EventEmitter = require('events');
const fs = require('fs');

module.exports = (()=> {
    let _ = new WeakMap();
    /**
     * Timed file-watcher mechanism
     */
    class TimedFileQueueController extends EventEmitter{
        /**
         * Given a list of folder locations, setup a file watcher for each folder, storing a list of all files that get added to the folder.
         * Every <interval> milliseconds, emit the current list of files and clear list. 
         * 
         * Effectively creates a notification about how many files were added to the folder in a given timeframe
         *  
         * @param {String[]} folderLocations Locations to watch for files on
         * @param {Number} interval Number of milliseconds after which to clear file queue and emit list
         */
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
                    _.get(this).watchers[loc] = fs.watch(loc,(eventType,dirName)=>{
                        if( dirName ){
                            fs.readdir(loc + "\\" + dirName,(err,files)=>{
                                if( files ){
                                    let prefix =  dirName + "\\";
                                    let f = files.map(ent => prefix + ent);
                                    console.log('f:',f);
                                    _.get(this).objectQueues[loc].push(...f);
                                }
                            })
                            //console.log(`filename provided: ${filename},`,eventType);
                            //_.get(this).objectQueues[loc].push(dirName);
                        }
                    });
                    _.get(this).objectQueues[loc] = [];
                }
                setInterval(this._clearObjects.bind(this),interval)
            }catch(err){ errTracer( CLASSNAME,'constructor',err); }
        }
        /**
         * Internal method, clearing objects from current queues
         */
        _clearObjects(){
            try{
                let emitObj = {};
                for( let loc in _.get(this).objectQueues ){
                    emitObj[loc] = [... new Set(_.get(this).objectQueues[loc])];
                    _.get(this).objectQueues[loc] = [];
                }
                console.log('emitting...');
                console.log(emitObj);
                this.emit('files',emitObj);
            }catch(err){ errTracer( CLASSNAME, 'clearObjects',err); }
        }

    }
    return TimedFileQueueController;
})();