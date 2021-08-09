# Grithin's Lodash Enhancements

## What

Various general use extensions I've written for lodash

## Examples

**Flattening Full Objects**
```js
_.flatten_to_input({bob:{sue:'bill'}})
//> {"bob[sue]":"bill"}

_.unflatten_input({"bob[sue]":"bill"})
//> {"bob":{"sue":"bill"}}
```

**Flattening Selected Parts**
```js
_.flatten_parts_to_input({"bill":{"moe":"phil"},"bob":{"sue":"bill","mill":"jan"}}, ['bob'])
//> {"bill":{"moe":"phil"},"bob[sue]":"bill","bob[mill]":"jan"}

_.unflatten_input_parts({"bob[sue]":"bill", "bob[mill]":"jan", "bill[moe]":"phil"}, ['bob'])
//> {"bill[moe]":"phil","bob":{"sue":"bill","mill":"jan"}}
```