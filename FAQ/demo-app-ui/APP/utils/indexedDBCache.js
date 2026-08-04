/**
 * IndexedDB缓存，用于前端缓存大型数据，如图片数据
 * 
 */
(function(){
    // IndexedDb缓存管理类
    class CacheManage {
        constructor(dbConfig) {
            this.db_name = localStorage.getItem('currentConfigKey') + '-' + (dbConfig?.db_name || 'cacheImages')
            this.storeName = dbConfig?.storeName || 'menuIcons'
            this.keyPath = dbConfig?.keyPath || 'row_guid'
            this.indexs = dbConfig?.indexs || [] //其它索引
            this.db = null  
            this.expireTime = dbConfig?.expireTime || 0.5 * 24 * 60 * 60 * 1000 //默认缓存12小时
        }
        // 打开数据库
        async openDB() {
            if (this.db) return this.db
            return new Promise((resolve, reject) => {
                try {
                    const request = indexedDB.open(this.db_name)
                
                    request.onsuccess = (event) => {
                        this.db = event.target.result            
                        resolve(this.db)
                    }
                    
                    request.onerror = async (error)=>{
                        console.log(error)
                        resolve(null)
                    }
                    
                    request.onupgradeneeded = (event) => {
                        localStorage.setItem("indexedDBVersion", event.newVersion)
                        const db = event.target.result
                        if (!db.objectStoreNames.contains(this.storeName)) {
                            const store = db.createObjectStore(this.storeName, { keyPath: this.keyPath })
                            this.indexs.forEach(index => {
                                store.createIndex(index, index)
                            })
                        }
                    }
                } catch (error) {
                    console.log(error)
                    resolve(null)
                }
            })
        }

        /**
         * indexeddb数据的增删改查
         * @param {object} data 操作的数据
         */
        addOrPutData(data = {}) {
            if(!data.expireTime){
                //设置默认过期时间
                data.expireTime = this.expireTime
            }
            if(!data.cacheTime){
                data.cacheTime = Date.now()
            }
            return new Promise((resolve, reject) => {
            try{
                    var request = this.db
                        .transaction([this.storeName], "readwrite") //事物对象，指定表格名称和操作模式（"只读"或"读写"）
                        .objectStore(this.storeName) //仓库对象 
                        .put(data) //有则修改，没有则新增
                        
                    request.onsuccess = (event) => {
                        resolve(event)
                    }
                    
                    request.onerror = (event) => {
                        console.log("数据写入失败")
                        resolve(event)
                    }
            }catch(error){
                console.log(error)
                resolve(null)
            }
            })
        }

        //通过主键查询数据
        getDataByKey(key) {
            return new Promise((resolve, reject) => {
                try{
                    var transaction = this.db.transaction([this.storeName])
                    var objectStore = transaction.objectStore(this.storeName)
                    var request = objectStore.get(key)

                    request.onerror = (event) => {
                        console.log('查询失败')
                        resolve(event)
                    }
                    
                    request.onsuccess = (event) => {
                        resolve(request.result)
                    }
                }catch(error){
                    console.log(error)
                    resolve(null)
                }
            })
        }

        //通过游标查询数据（获取整个仓库的所有记录）
        getAllData() {
            return new Promise((resolve, reject) => {
                var list = []
                var store = this.db
                    .transaction(this.storeName, 'readonly')  // 修复：改为只读
                    .objectStore(this.storeName)
                    
                var request = store.openCursor()
                
                request.onsuccess = (e) => {
                    var cursor = e.target.result
                    if (cursor) {
                        list.push(cursor.value)
                        cursor.continue()
                    } else {
                        resolve(list)
                    }
                }
                
                request.onerror = (e) => {
                    resolve(e)
                }
            })
        }

        //通过索引获取数据
        getDataByIndex(indexName, indexValue) {
            return new Promise((resolve, reject) => {
                var store = this.db
                    .transaction(this.storeName, 'readonly')  // 修复：改为只读
                    .objectStore(this.storeName)
                    
                var request = store.index(indexName).get(indexValue)
                
                request.onerror = () => {
                    console.log('索引获取数据失败')
                    resolve()
                }
                
                request.onsuccess = (e) => {
                    var result = e.target.result
                    resolve(result)
                }
            })
        }

        //通过游标和索引查询数据
        getDataByIndexAndCursor(indexName, indexValue) {
            return new Promise((resolve, reject) => {
                var list = []
                var store = this.db
                    .transaction(this.storeName, 'readonly')  // 修复：改为只读
                    .objectStore(this.storeName)
                    
                var request = store.index(indexName).openCursor(IDBKeyRange.only(indexValue))
                
                request.onsuccess = (e) => {
                    var cursor = e.target.result
                    if (cursor) {
                        list.push(cursor.value)
                        cursor.continue()
                    } else {
                        resolve(list)
                    }
                }
                
                request.onerror = (e) => {
                    resolve(e)
                }
            })
        }

        //通过主键删除数据
        deleteDBByKey(key) {
            return new Promise((resolve, reject) => {
                var request = this.db
                    .transaction([this.storeName], "readwrite")
                    .objectStore(this.storeName)
                    .delete(key)
                    
                request.onsuccess = (event) => {
                    resolve(event)
                }
                
                request.onerror = (event) => {
                    console.log("数据删除失败")
                    resolve(event)
                }
            })
        }

        //通过索引删除数据
        deleteDBByIndex(indexName, indexValue) {
            return new Promise((resolve, reject) => {
                var store = this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName)
                var request = store
                    .index(indexName)
                    .openCursor(IDBKeyRange.only(indexValue))
                    
                let deleteCount = 0;
                
                request.onsuccess = (e) => {
                    var cursor = e.target.result
                    if (cursor) {
                        cursor.delete()
                        deleteCount++
                        cursor.continue()
                    } else {
                        resolve(deleteCount)
                    }
                }
                
                request.onerror = (e) => {
                    resolve(e)
                }
            })
        }

        //判断缓存是否过期
        hasExpired(cacheData){
            return (Date.now() - cacheData.cacheTime) > cacheData.expireTime
        }

        // 清空整个对象仓库
        clearStore() {
            return new Promise((resolve, reject) => {
                var request = this.db
                    .transaction([this.storeName], "readwrite")
                    .objectStore(this.storeName)
                    .clear()
                    
                request.onsuccess = (event) => {
                    resolve(event)
                }
                
                request.onerror = (event) => {
                    console.log("清空仓库失败")
                    resolve(event)
                }
            })
        }

        closeDB() {
            if (this.db) {
                this.db.close()
                // console.log(this.db_name + '数据库已关闭！')
            }
        }

    }
    window.CacheManage = CacheManage
})()
