# WASM hints generator

Sadly attempts to do this in pure JS failed (speed + limitations on Map / Array sizes).

Test via native binary:

```
$ cargo run --release  -- ../content/ a0_inside a4_finale
```

Build WASM:

```
(from binding/ subdirectory)
binding $ wasm-pack build
```