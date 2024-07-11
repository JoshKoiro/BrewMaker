<picture width="40%" align="right">
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JoshKoiro/BrewMaker/dev/img/logo-dark.png"> 
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JoshKoiro/BrewMaker/dev/img/logo-light.png"> 
</picture>

<h1 align="left">BrewMaker</h1>
Form Configuration client for the FormBrew Framework

## Description

BrewMaker is part of the [FormBrew Framework](https://github.com/JoshKoiro/FormBrew) . BrewMaker is a web-based tool designed to create and manage complex form structures with conditional logic. It allows users to define form groups, fields, and conditions that control the visibility and behavior of form elements. This tool is particularly useful for creating dynamic forms that adapt based on user input.

## Features

- Create and manage form groups and fields
- Define conditional logic for form elements
- Support for various field types
- Drag-and-drop functionality for reordering groups and fields
- Collapsible groups and conditions for easier navigation
- Import and export functionality (JS and JSON formats)

## Setup

1. Clone the repository or download the source files.
2. Open `brewMaker.html` in a modern web browser.

## Usage

### Creating a Form

1. Click "Add Group" to create a new form group.
2. Within each group, click "Add Field" to add form fields.
3. Configure each field by setting its name, type, and whether it's required.
4. For select fields, enter comma-separated options.

### Adding Conditions

1. In the Conditions section, click "Add Condition" to create a new condition.
2. Optionally, give the condition a name for better organization.
3. Add triggers ("If" statements) and actions ("Then" statements) to define the condition's behavior.

### Drag and Drop

- Click and drag groups or fields to reorder them within the form.

### Importing and Exporting

- Use the "Export as JS" button to export the configuration to use within the FormBrew Framework.  There is also an option to "Export as JSON" to save your form configuration.
- Use the file input to import a previously exported configuration.

## Browser Compatibility

This tool is designed to work with modern web browsers that support ES6+ JavaScript features. It has been tested on the latest versions of Chrome, Firefox, and Safari.

## Contributing

Contributions to improve the Form Configuration Builder are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear, descriptive commit messages.
4. Push your branch and submit a pull request.

<!-- <img src="https://raw.githubusercontent.com/JoshKoiro/BrewMaker/dev/img/logo-dark.png" width="40%" align="right">
<img src="https://raw.githubusercontent.com/JoshKoiro/BrewMaker/dev/img/logo-light.png" width="40%" align="right"> -->
