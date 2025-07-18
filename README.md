<img src="https://byjaris.com/mentioner/media/mentioner-logo.svg" width="420">

###
###
# Mentioner for Editor.js

An **Inline Tool** for [Editor.js](https://editorjs.io/) that turns `@mentions`, `#hashtags`, and URLs into clickable links on the fly.

Its key feature is **total flexibility**. Unlike other tools, **Mentioner** allows you to completely customize the link destinations for any platform you want, making it a perfect fit for any project.

![](https://byjaris.com/mentioner/media/mentioner.gif)

---

## 🔥 Key Features

*   **@mentions**: Turn `@user` into profile links.
*   **#hashtags**: Turn `#tag` into search or tag links.
*   **#{Multi-word Searches}**: Special support for terms with spaces, like `#{plugins for editor js}`, ideal for search queries.
*   **URL Auto-linking**: Automatically converts `site.com` into a clickable link.
*   **Highly Configurable**: Define your own endpoints for `@` and `#`. Want `@user` to point to TikTok? And `#tag` to a Google search? You can!
*   **User Feedback**: Visual notifications when an action isn't possible, improving the user experience.
*   **Tooltip** to display the link destination when hovering over a mention or hashtag.
*   **Zero Dependencies**: A single JS file with no external CSS required. Truly plug-and-play.

## Installation

### 1. Download from GitHub and load the plugin `editorjs-mentioner.js` in your HTML page.

```html
<script src="/path/to/editorjs-mentioner.js"></script>
```

## Usage

Import and add the tool to your Editor.js configuration.

```javascript

const editor = new EditorJS({
  // ... other settings

  tools: {
    mentioner: {
      class: Mentioner,
      shortcut: 'CMD+L', // Optional shortcut
    },
  },
});
```

## Advanced Configuration (The Power of Mentioner)

Here's the real magic. Use the `config` object to customize the plugin's behavior and adapt it to any need.

```javascript
const editor = new EditorJS({
  // ...

  tools: {
    mentioner: {
      class: Mentioner,
      shortcut: 'CMD+L',
      config: {
        '@': 'https://tiktok.com/@',
        '#': 'https://www.google.com/search?q={}',
      }
    }
  },
});
```

### Configuration Examples

#### Example 1: @mentions for TikTok

TikTok requires the format `tiktok.com/@user`. Simply define the full prefix in the configuration:

```javascript
//...
config: {
  '@': 'https://www.tiktok.com/@', // Will generate: https://www.tiktok.com/@username
}
//...
```

#### Example 2: #hashtags for Instagram (Default Behavior)

If you don't provide a configuration, this is the default behavior. To be explicit:

```javascript
//...
config: {
  '#': 'https://instagram.com/explore/tags/', // Will generate: https://instagram.com/explore/tags/your_tag
}
//...
```

#### Example 3: #hashtags for a Google Search 🔥

Use the `{}` placeholder to create search links. The plugin will automatically encode the term to be URL-safe.

```javascript
//...
config: {
  '#': 'https://www.google.com/search?q={}',
}
//...
```

With this configuration:
-   Selecting `#editorjs` will create the link `.../search?q=editorjs`.
-   Selecting `#{plugins for editor js}` will create the link `.../search?q=plugins%20for%20editor%20js`.

## Output Data

The plugin saves content as simple HTML within the paragraph block, ensuring full compatibility with any HTML renderer.

```json
{
  "type": "paragraph",
  "data": {
    "text": "You can talk to <a href=\"https://www.tiktok.com/@byjaris\" target=\"_blank\">@byjaris</a> and search for <a href=\"https://www.google.com/search?q=editorjs%20plugins\" target=\"_blank\">#{editorjs plugins}</a>."
  }
}
```

## Contributing

Feel free to open an *issue* or submit a *pull request*. All contributions are welcome!

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Credits

&copy; 2025 | Made with ❤️ by Jaris GV | <a href="https://byjaris.com" target="_blank">byJaris</a>
