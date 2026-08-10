import { describe, expect, it } from 'vitest'

import { createTranslator } from '@/lib/i18n'
import { ORGAN_LIST, ORGAN_NODE_NAMES, getOrganInfo, getOrganInfoByMeshName } from '../organConfig'

const EXPECTED_ORGAN_MAPPING = [
  { nodeName: 'da_day', meshNames: ['digestive_system001', 'digestive_system003'] },
  { nodeName: 'thuc_quan', meshNames: ['digestive_system005'] },
  { nodeName: 'ruot_non', meshNames: ['digestive_system009'] },
  { nodeName: 'ruot_gia', meshNames: ['digestive_system008'] },
  { nodeName: 'gan', meshNames: ['digestive_system006'] },
  { nodeName: 'tui_mat', meshNames: ['digestive_system007'] },
  { nodeName: 'tuy', meshNames: ['digestive_system010'] },
  { nodeName: 'mieng', meshNames: ['digestive_system004'] },
]

const ACTUAL_FBX_NODE_NAMES = new Set([
  'digestive_system007',
  'digestive_system010',
  'digestive_system',
  'digestive_system001',
  'digestive_system008',
  'digestive_system009',
  'digestive_system002',
  'digestive_system004',
  'digestive_system005',
  'digestive_system003',
  'digestive_system006',
])

describe('organConfig', () => {
  it('maps logical organs to the exact selectable FBX mesh names', () => {
    expect(
      ORGAN_LIST.map((organ) => ({
        nodeName: organ.nodeName,
        meshNames: organ.meshNames,
      })),
    ).toEqual(EXPECTED_ORGAN_MAPPING)
  })

  it('every organ has locale keys in English and Vietnamese', () => {
    const tEn = createTranslator('en')
    const tVi = createTranslator('vi')

    for (const organ of ORGAN_LIST) {
      expect(organ.displayNameKey).toMatch(/^viewer\.organ\.[^.]+\.name$/)
      expect(organ.descriptionKey).toMatch(/^viewer\.organ\.[^.]+\.description$/)
      expect(tEn(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tEn(organ.descriptionKey)).not.toBe(organ.descriptionKey)
      expect(tVi(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tVi(organ.descriptionKey)).not.toBe(organ.descriptionKey)
    }
  })

  it('maps every selectable FBX mesh name to its logical organ', () => {
    for (const expectedOrgan of EXPECTED_ORGAN_MAPPING) {
      const organ = getOrganInfo(expectedOrgan.nodeName)

      expect(organ?.nodeName).toBe(expectedOrgan.nodeName)
      for (const meshName of expectedOrgan.meshNames) {
        expect(ACTUAL_FBX_NODE_NAMES.has(meshName)).toBe(true)
        expect(getOrganInfoByMeshName(meshName)).toBe(organ)
      }
    }
  })

  it('exposes selectable mesh names through ORGAN_NODE_NAMES', () => {
    const expectedMeshNames = EXPECTED_ORGAN_MAPPING.flatMap((organ) => organ.meshNames)

    expect(ORGAN_NODE_NAMES).toEqual(new Set(expectedMeshNames))
  })

  it('does not map non-selectable root and leftover FBX nodes', () => {
    expect(ORGAN_NODE_NAMES.has('digestive_system')).toBe(false)
    expect(ORGAN_NODE_NAMES.has('digestive_system002')).toBe(false)
    expect(getOrganInfoByMeshName('digestive_system')).toBeUndefined()
    expect(getOrganInfoByMeshName('digestive_system002')).toBeUndefined()
  })

  it('logical organ ids are unique', () => {
    const names = ORGAN_LIST.map((o) => o.nodeName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('raw FBX mesh names are unique', () => {
    const meshNames = ORGAN_LIST.flatMap((o) => o.meshNames)
    expect(new Set(meshNames).size).toBe(meshNames.length)
  })

  it('getOrganInfo returns organ by logical organ id', () => {
    const first = ORGAN_LIST[0]
    expect(getOrganInfo(first.nodeName)).toBe(first)
  })

  it('getOrganInfo returns undefined for unknown nodeName', () => {
    expect(getOrganInfo('nonexistent_organ')).toBeUndefined()
  })

  it('empty mesh names are not mapped', () => {
    expect(ORGAN_NODE_NAMES.has('')).toBe(false)
    expect(getOrganInfoByMeshName('')).toBeUndefined()
  })
})
