# tsrouter2

`tsrouter2` is a TypeScript-based router inspired by the efficient use of template literals for route parsing, with a focus on speed and simplicity. It utilizes the trie data structure for fast route matching and is incredibly lightweight.

## Key Features

- **Template Literals Inspired**: The basic idea comes from [ghoullier's awesome-template-literal-types](https://github.com/ghoullier/awesome-template-literal-types?tab=readme-ov-file#router-params-parsing), which provides a powerful and intuitive way to define routes.
- **Uses Trie**: Built on the [trie](https://en.wikipedia.org/wiki/Trie) data structure, ensuring fast route lookups.
- **Performance**: `tsrouter2` is speedy. Check out the [benchmark results](https://github.com/zhy0216/tsrouter/blob/master/benchmarks/result.png) to see how it compares.
- **Lightweight**: The package is tiny, weighing in at just 1.3kb after minification and 0.8kb when gzipped.

## Important Notes

- `tsrouter2` currently only matches the request's pathname, not the full URL.
- The matching order prioritizes static segments over dynamic ones, starting with the most specific routes rather than the order in which they were inserted.
- Wildcard is only supported in the last segment of the route path.


## Installation

Install `tsrouter2` using npm or yarn:

```bash
bun install tsrouter2
# or
npm install tsrouter2
```

## Quick Start

```typescript
import { Router } from 'tsrouter2';

const router = new Router<{ userId: number }>();

router.get('/users/:userId', async (ctx) => {
  const userId = ctx.params.userId;
  console.log(`User with ID ${userId} requested.`);
  // ... handle logic
});

router.post('/users/:userId/books', async (ctx) => {
  const userId = ctx.params.userId;
  console.log(`User with ID ${userId} added a book.`);
  // ... handle logic
});

// Simulate a request
const handler = router.match('GET', '/users/123');
if (handler) {
  const response = await handler({ userId: 123 });
  // ... send response
}
```

## To-Do

- **Add Examples**: Detailed usage examples and perhaps a simple guide are planned to help users get started with `tsrouter2`.
- support typebox validation
- support middleware?

Contributing
Contributions of any kind are welcome! Please fork the repository, submit a pull request, or raise an issue for suggestions.
