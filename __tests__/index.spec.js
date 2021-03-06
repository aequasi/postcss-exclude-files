import excludeFiles from '../src/'
import postcss from 'postcss'
import testPlugin from '../helpers/plugin'


let css, target

beforeAll(() => {
  css = 'div { display: flex; }'
  target = 'div { display: -ms-flex; display: -webkit-flex; display: flex; }'
})

describe('when test-plugin used without exclude files wrapper', () => {
  it('test-plugin can be function and produce prefixed css', () => {
    const result = postcss([testPlugin()]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })

  it('test-plugin can be initializer and produce prefixed css', () => {
    const result = postcss([testPlugin]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })

  it('test-plugin can processing without postcss and produce prefixed css', () => {
    const result = testPlugin.process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })
})


describe('when other plugins wrapped by exclude files plugin with invalud options', () => {
  it('filter parameter must be a glob string or an array of glob strings', () => {
    const invalidFilters = [NaN, null, undefined, 0, 1, true, false, {}]

    invalidFilters.forEach(filter => {
      const result = () => excludeFiles({
        filter,
        plugins: testPlugin()
      })

      expect(result).toThrow('The filter parameter must be a glob string or an array of glob strings')
    })
  })

  it('plugins parameter must be (function | arrray | object)', () => {
    const invalidPlugins = [NaN, null, undefined, 0, 1, true, false, 'bad plugin']

    invalidPlugins.forEach(plugins => {
      const result = () => excludeFiles({
        filter: '',
        plugins
      })

      expect(result).toThrow('The plugins parameter must be function or object or Array')
    })
  })
})


describe('when other pligins wrapped by exclude files plugin and css pass to processing', () => {
  it('plugin can be a function', () => {
    expect.hasAssertions()

    const result = postcss([
      excludeFiles({
        filter:  '',
        plugins: testPlugin()
      })
    ]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })

  it('plugin can be a initializer', () => {
    expect.hasAssertions()

    const result = postcss([
      excludeFiles({
        filter:  '',
        plugins: testPlugin
      })
    ]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })

  it('plugin can be a postcss bundle and initializer', () => {
    expect.hasAssertions()

    const result = postcss([
      excludeFiles({
        filter:  '',
        plugins: [
          postcss([testPlugin])
        ]
      })
    ]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })

  it('plugin can be a postcss bundle and function', () => {
    expect.hasAssertions()

    const result = postcss([
      excludeFiles({
        filter:  '',
        plugins: [
          postcss([testPlugin()])
        ]
      })
    ]).process(css)

    return expect(result).resolves.toMatchObject({ css: target })
  })
})


describe('when other pligins wrapped by exclude files plugin and css excluded from processing', () => {
  it('wrapped plugins will not run', () => {
    expect.hasAssertions()

    const root = postcss.parse(css)
    root.source.input.file = '/frontend/node_modules/test/styles.css'

    const result = postcss([
      excludeFiles({
        filter:  ['**/node_modules/**'],
        plugins: testPlugin
      }),
      testPlugin
    ]).process(root)

    return expect(result).resolves.toMatchObject({ css: target })
  })
})
