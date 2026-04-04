import { Image } from "@tiptap/extension-image";

export const CustomImage = Image.extend({

  name: "customImage",

  addAttributes() {

    return {

      ...this.parent?.(),

      caption: {
        default: "",
        parseHTML: element => element.getAttribute("data-caption"),
        renderHTML: attributes => {
          if (!attributes.caption) return {}
          return { "data-caption": attributes.caption }
        },
      },

      source: {
        default: "",
        parseHTML: element => element.getAttribute("data-source"),
        renderHTML: attributes => {
          if (!attributes.source) return {}
          return { "data-source": attributes.source }
        },
      },

    }

  },

});