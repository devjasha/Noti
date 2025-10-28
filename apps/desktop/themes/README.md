# Creating Custom Themes for Noti

This guide will help you create your own custom themes for the Noti note-taking application.

## Theme File Structure

Themes are defined as JSON files in the `themes/` directory. Each theme file follows a standardized format that defines colors, shadows, and border radius values.

## Basic Theme Template

```json
{
  "name": "Your Theme Name",
  "author": "Your Name",
  "version": "1.0.0",
  "description": "A brief description of your theme",
  "type": "light",
  "colors": {
    "primary": "#3D7AED",
    "primaryHover": "#2563EB",
    "secondary": "#6B7280",
    "accent": "#10B981",
    "background": "#FFFFFF",
    "surface": "#F9FAFB",
    "headerBg": "#F3F4F6",
    "foreground": "#111827",
    "textPrimary": "#111827",
    "textSecondary": "#4B5563",
    "textMuted": "#9CA3AF",
    "border": "#E5E7EB",
    "borderLight": "#F3F4F6"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
  },
  "radius": {
    "default": "8px",
    "sm": "6px"
  }
}
```

## Field Descriptions

### Metadata Fields

- **name**: The display name of your theme (shown in the theme selector)
- **author**: Your name or username
- **version**: Version number following semantic versioning (e.g., "1.0.0")
- **description**: A brief description of your theme's inspiration or characteristics
- **type**: Either `"light"` or `"dark"` - indicates the theme's overall brightness

### Color Fields

All colors should be in hex format (e.g., `#RRGGBB`).

#### Primary & Interactive Colors
- **primary**: Main brand/accent color used for buttons, links, and highlights
- **primaryHover**: Darker/lighter shade of primary for hover states
- **secondary**: Secondary accent color for less prominent elements
- **accent**: Additional accent color for special highlights or badges

#### Background Colors
- **background**: Main background color for the application
- **surface**: Color for elevated surfaces (cards, modals, sidebars)
- **headerBg**: Background color for headers (optional, defaults to surface)
- **foreground**: Foreground/content color (typically opposite of background)

#### Text Colors
- **textPrimary**: Main text color for headings and important content
- **textSecondary**: Secondary text color for body text
- **textMuted**: Muted text color for less important information

#### Border Colors
- **border**: Main border color for inputs, dividers, etc.
- **borderLight**: Lighter border color for subtle separations

### Shadow Fields

Shadows should follow the CSS `box-shadow` format.

- **sm**: Small shadow for subtle depth
- **md**: Medium shadow for cards and elevated elements
- **lg**: Large shadow for modals and prominent overlays

### Radius Fields

Border radius values should include units (e.g., `"8px"`).

- **default**: Standard border radius for most elements
- **sm**: Smaller border radius for compact elements

## Creating a Dark Theme

For dark themes, follow these general guidelines:

1. Set `"type": "dark"`
2. Use darker background colors (e.g., `#1F1F28` for background)
3. Use lighter text colors (e.g., `#DCD7BA` for textPrimary)
4. Adjust shadow opacity - dark themes often need subtler shadows
5. Ensure sufficient contrast between text and background (WCAG AA recommended)

Example dark theme colors:
```json
{
  "type": "dark",
  "colors": {
    "background": "#1F1F28",
    "surface": "#2A2A37",
    "textPrimary": "#DCD7BA",
    "textSecondary": "#C8C093",
    "border": "#363646"
  }
}
```

## Installing Your Theme

1. Create a new JSON file in the `themes/` directory
2. Name it using lowercase and hyphens (e.g., `my-awesome-theme.json`)
3. Follow the structure outlined above
4. Restart the application or reload the themes
5. Your theme will appear in the theme selector in Settings

## Testing Your Theme

1. Open the Noti application
2. Click the Settings button (gear icon) at the bottom of the file tree
3. Find your theme in the theme selector dropdown
4. Click to apply and preview your theme
5. Check all UI elements:
   - Buttons and interactive elements (primary, primaryHover)
   - Text readability (textPrimary, textSecondary, textMuted)
   - Borders and separators (border, borderLight)
   - Shadows and depth perception (shadows.sm, md, lg)
   - Modal and overlay visibility

## Example Themes

Check out the included themes for inspiration:

- **Inkdrop Light**: Clean, professional light theme
- **Inkdrop Dark**: Elegant dark theme with good contrast
- **Kanagawa**: Dark theme inspired by Japanese wave paintings
- **Dracula**: Popular dark theme with vibrant colors
- **Nord**: Arctic-inspired cool color palette

## Tips for Great Themes

1. **Contrast**: Ensure text is readable on backgrounds (use a contrast checker)
2. **Consistency**: Use a cohesive color palette with related hues
3. **Accessibility**: Test with users who have color vision deficiencies
4. **Purpose**: Consider the theme's use case (coding, writing, reading)
5. **Inspiration**: Base your theme on existing color schemes you love
6. **Test extensively**: Check all parts of the UI in different states

## Color Palette Resources

- [Coolors.co](https://coolors.co/) - Color palette generator
- [Adobe Color](https://color.adobe.com/) - Color wheel and harmony tools
- [Paletton](https://paletton.com/) - Color scheme designer
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility testing

## Sharing Your Theme

If you create a theme you'd like to share:

1. Ensure all fields are properly filled out
2. Test thoroughly across the application
3. Submit a pull request to the Noti repository
4. Include screenshots of your theme in action
5. Credit any inspiration or original color schemes

## Troubleshooting

**Theme not appearing**: Check that your JSON is valid (use a JSON validator)

**Colors look wrong**: Verify all hex codes are in `#RRGGBB` format

**Text is unreadable**: Adjust contrast between text colors and backgrounds

**Theme crashes the app**: Ensure all required fields are present

## Contributing

We welcome theme contributions! Please follow the guidelines above and submit themes that:
- Are original or properly credited
- Have good contrast and accessibility
- Are well-tested across the application
- Include thoughtful descriptions

Happy theming!
