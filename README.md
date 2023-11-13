# Pozor, padá hviezda

Pozor, padá hviezda is a point-and-click adventure game made for [Špongia 2023](https://www.smnd.sk/mikey/PHP/spongia/spongia_2023/) game jam.

- Play on [projects.mravcak.com/hviezda](https://projects.mravcak.com/hviezda/)
- The latest `main` is automatically deployed to [spongia-23.vercel.app](https://spongia-23.vercel.app)
- The version submitted for the game jam is available at [projects.mravcak.com/hviezda/submitted](https://projects.mravcak.com/hviezda/submitted)

## Project Setup

```sh
cd player-vue
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Notes

If symlinks are not working on your system, you need to move the `content` directory into `player-vue/src`.

There is an alternative player in `player-vanilla`, but it doesn't support the current content files (yet?).

There is also a content editor in `editor`.

The `adventure` directory contains an (early proof-of-concept prototype)[https://adventure-lovat.vercel.app] of the game.
