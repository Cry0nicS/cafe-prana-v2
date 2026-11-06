import { describe, expect, it } from 'vitest'
import { distinctLabels, formatMenuPrice } from '../../app/utils/menu'

// The owner types prices by hand in Studio; every shape the content uses
// today has to come out as a proper price in both languages.
describe('formatMenuPrice', () => {
  it.each([
    ['5,3', '€5.30', '5,30 €'],
    ['5.6', '€5.60', '5,60 €'],
    ['4', '€4', '4 €'],
    ['6-7', '€6–€7', '6 €–7 €'],
    ['11,5-16', '€11.50–€16', '11,50 €–16 €'],
    ['2,5 / 3,3', '€2.50 / €3.30', '2,50 € / 3,30 €'],
    ['5/9 ', '€5 / €9', '5 € / 9 €']
  ])('formats %s', (price, en, de) => {
    expect(formatMenuPrice(price, 'en').replace(/\s/g, ' ')).toBe(en)
    expect(formatMenuPrice(price, 'de').replace(/\s/g, ' ')).toBe(de)
  })

  it('shows anything that is not a number as typed', () => {
    expect(formatMenuPrice('on request', 'en')).toBe('on request')
    expect(formatMenuPrice('', 'en')).toBe('')
  })
})

describe('distinctLabels', () => {
  const lookup = {
    'vegan': { id: 'vegan', label: 'Vegan' },
    'gluten-free': { id: 'gluten-free', label: 'Gluten-free' },
    'seasonal': { id: 'seasonal', label: 'Seasonal' }
  }

  it('drops the labels every dish has and unknown ids', () => {
    expect(distinctLabels(['vegan', 'gluten-free', 'seasonal', 'gone'], lookup)).toEqual([lookup.seasonal])
    expect(distinctLabels(undefined, lookup)).toEqual([])
  })
})
