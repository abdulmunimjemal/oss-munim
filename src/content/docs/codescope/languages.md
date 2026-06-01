---
title: Languages
description: The 21 languages codescope parses, and what's extracted from each.
---

codescope parses **21 languages** with [tree-sitter](https://tree-sitter.github.io)
(WebAssembly grammars — no native build step). Every language gets **definition
extraction** (functions, classes, methods, interfaces, types, enums); **call and
import edges** are extracted for the languages whose grammars expose them cleanly.

| Language | Extensions | Definitions | Calls | Imports |
|----------|-----------|:-----------:|:-----:|:-------:|
| TypeScript | `.ts` `.mts` `.cts` | ✓ | ✓ | ✓ |
| TSX / JSX | `.tsx` `.jsx` | ✓ | ✓ | ✓ |
| JavaScript | `.js` `.mjs` `.cjs` | ✓ | ✓ | ✓ |
| Python | `.py` `.pyi` | ✓ | ✓ | ✓ |
| Go | `.go` | ✓ | ✓ | ✓ |
| Rust | `.rs` | ✓ | ✓ | ✓ |
| Java | `.java` | ✓ | ✓ | ✓ |
| Ruby | `.rb` | ✓ | ✓ | — |
| C | `.c` `.h` | ✓ | ✓ | ✓ |
| C++ | `.cpp` `.cc` `.cxx` `.hpp` `.hh` | ✓ | ✓ | ✓ |
| C# | `.cs` | ✓ | ✓ | ✓ |
| PHP | `.php` | ✓ | ✓ | ✓ |
| Scala | `.scala` `.sc` | ✓ | ✓ | ✓ |
| Solidity | `.sol` | ✓ | ✓ | ✓ |
| Zig | `.zig` | ✓ | ✓ | — |
| Kotlin | `.kt` `.kts` | ✓ | — | ✓ |
| Objective-C | `.m` | ✓ | ✓ | ✓ |
| Lua | `.lua` | ✓ | — | — |
| Bash | `.sh` `.bash` | ✓ | — | — |
| OCaml | `.ml` `.mli` | ✓ | — | — |
| ReScript | `.res` | ✓ | ✓ | — |

## What "definitions" means

A definition is anything you'd jump to with go-to-definition: functions, methods,
classes, interfaces, type aliases, and enums (plus arrow-function bindings like
`const x = () => …`). Method definitions track their enclosing class as a
container, so codescope knows `run` is a method of `Service`.

## Notes

- **Calls are kind-aware.** A bare `foo()` is recorded as a `call`; `obj.foo()`
  as a `method` call. This lets the graph resolve a bare call to a *function*
  named `foo` and a method call to a *method* named `foo`, avoiding the classic
  collision when a project happens to define a function called `push`.
- **Rust `impl` methods** are currently labelled `function` (impl blocks aren't
  tracked as containers).
- **Grammar compatibility.** Swift, Dart, and Elm grammars in the upstream WASM
  set target a tree-sitter ABI outside codescope's supported range and are
  excluded rather than shipped broken.
