const CACHE_NAME = 'tutu-phone-cache-v1';

// 这里填入你希望用户在离线时也能访问的核心文件
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
    // 后续如果你增加了新的 app 文件，比如 './diary.html'，也可以加到这里
];

// 安装阶段：缓存核心资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 拦截请求阶段：优先使用缓存，没有缓存则发起网络请求 (Cache First 策略)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果在缓存中找到匹配的请求，则直接返回缓存
                if (response) {
                    return response;
                }
                // 否则通过网络获取
                return fetch(event.request).then(
                    function(networkResponse) {
                        // 检查是否是有效的响应
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // 克隆响应，因为 response 是一个流，只能被消耗一次
                        var responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                );
            })
    );
});

// 激活阶段：清理旧版本的缓存
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
