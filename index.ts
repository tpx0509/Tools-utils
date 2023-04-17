/*
 * debounce：实现函数的防抖（目的是频繁触发中只执行一次）
 *  @params
 *     func:需要执行的函数
 *     wait:检测防抖的间隔频率
 *     immediate:是否是立即执行（如果为TRUE是控制第一次触发的时候就执行函数，默认FALSE是以最后一次触发为准）
 *  @return
 *     可被调用执行的函数
 */
function debounce(func, wait = 100, immediate = false) {
    let timer;
    return function anonymous(...params) {
        let now = immediate && !timer;
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            // 执行函数:注意保持THIS和参数的完整度
            !immediate ? func.call(this, ...params) : null;
        }, wait);
        now ? func.call(this, ...params) : null;
    };
}

/*
 * throttle：实现函数的节流（目的是频繁触发中缩减频率）
 *   @params
 *      func:需要执行的函数
 *      wait:自己设定的间隔时间(频率)
 *   @return
 *      可被调用执行的函数
 */
function throttle(func, wait = 100) {
    let timer,
        previous = 0; //记录上一次操作时间
    return function anonymous(...params) {
        let now = Date.now(), //当前操作的时间
            remaining = wait - (now - previous);
        if (remaining <= 0) {
            // 两次间隔时间超过频率：把方法执行即可
            clearTimeout(timer);
            timer = null;
            previous = now;
            func.call(this, ...params);
        } else if (!timer) {
            // 两次间隔时间没有超过频率，说明还没有达到触发标准呢，设置定时器等待即可（还差多久等多久）
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
                previous = Date.now();
                func.call(this, ...params);
            }, remaining);
        }
    };
}


/*
 * deepClone：实现对象或数组的深拷贝（lodash的当然更靠谱一些）
 *   @params
 *      params 对象或数组
 *      weak 不要传入（内部用于避免循环引用所需）
 *   @return
 *      全新的对象或数组
 */
function deepClone(params:any[]|{ [key:string]:any},weak = new WeakMap()) {
    if(!params || typeof params !== 'object') return params
    let clonedResult = weak.get(params)
    if(clonedResult)  return clonedResult;
    let result = Array.isArray(params) ? [] : {}
    for(let key in params) {
       result[key] = deepClone(params[key],weak)
       weak.set(params,result)
    }
    return result
}

/*
 * getFirstImgBase64 获取视频第某帧
 *   @params
 *      url 视频链接
 *      w 宽
 *      h 高
 *      targetTime 第几帧（视频的时长）
 *   @return
 *      全新的对象或数组
 */
function getFirstImgBase64 (url, w, h, targetTime) {
    return new Promise(function (resolve, reject) {
        let dataURL = ''
        let video = document.createElement('video')
        video.src = url
        video.crossOrigin = 'anonymous'
        video.preload = 'auto'
        // ★设定播放位置以获取当前播放位置的图像
        video.currentTime = targetTime
        // ★canplay事件——还没有加载足够的数据来播放媒体直到其结束，只加载了媒体当前位置的数据
        video.addEventListener('canplay', function () {
            console.log(video.duration, video.currentTime)
            let canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            canvas.getContext('2d')!.drawImage(video, 0, 0, w, h) // 绘制canvas，[资源地址,绘制起始横坐标,绘制起始纵坐标,绘制宽度,绘制高度]
            dataURL = canvas.toDataURL('image/jpeg') // 转换为base64
            resolve(dataURL)
        })
    })
}