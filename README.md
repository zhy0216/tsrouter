# tsrouter

basic idea is from https://github.com/ghoullier/awesome-template-literal-types?tab=readme-ov-file#router-params-parsing

* use [tire](https://en.wikipedia.org/wiki/Trie)
* the fastest router in the js world. see [results](https://github.com/zhy0216/tsrouter/blob/master/benchmarks/result.png)
* tiny (1.3kb after minify, 0.8kb after zip)

## Notice
* only match request's pathname
* match order starts from static segment first, not insert order.
* wildcard did not support in the middle

see examples & [tests](https://github.com/zhy0216/tsrouter/blob/master/index.test.ts)

## TODO
* add example
