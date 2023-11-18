import { main } from './cli';

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
