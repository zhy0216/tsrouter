# tsrouter

basic idea is from https://github.com/ghoullier/awesome-template-literal-types?tab=readme-ov-file#router-params-parsing

* only match request's pathname
* use [tire](https://en.wikipedia.org/wiki/Trie)
* match order starts from static segment first, not insert order.

## TODO
* add test
* try while loop dfs, not sure if this will be faster.
* add wildcard
* release 1.0
