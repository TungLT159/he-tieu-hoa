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

describe('organConfig', () => {
  it('ports the existing organ mapping and i18n keys', () => {
    expect(
      ORGAN_LIST.map((organ) => ({
        nodeName: organ.nodeName,
        meshNames: organ.meshNames,
        displayNameKey: organ.displayNameKey,
        descriptionKey: organ.descriptionKey,
      })),
    ).toEqual([
      {
        nodeName: 'da_day',
        meshNames: ['digestive_system001', 'digestive_system003'],
        displayNameKey: 'viewer.organ.daDay.name',
        descriptionKey: 'viewer.organ.daDay.description',
      },
      {
        nodeName: 'thuc_quan',
        meshNames: ['digestive_system005'],
        displayNameKey: 'viewer.organ.thucQuan.name',
        descriptionKey: 'viewer.organ.thucQuan.description',
      },
      {
        nodeName: 'ruot_non',
        meshNames: ['digestive_system009'],
        displayNameKey: 'viewer.organ.ruotNon.name',
        descriptionKey: 'viewer.organ.ruotNon.description',
      },
      {
        nodeName: 'ruot_gia',
        meshNames: ['digestive_system008'],
        displayNameKey: 'viewer.organ.ruotGia.name',
        descriptionKey: 'viewer.organ.ruotGia.description',
      },
      {
        nodeName: 'gan',
        meshNames: ['digestive_system006'],
        displayNameKey: 'viewer.organ.gan.name',
        descriptionKey: 'viewer.organ.gan.description',
      },
      {
        nodeName: 'tui_mat',
        meshNames: ['digestive_system007'],
        displayNameKey: 'viewer.organ.tuiMat.name',
        descriptionKey: 'viewer.organ.tuiMat.description',
      },
      {
        nodeName: 'tuy',
        meshNames: ['digestive_system010'],
        displayNameKey: 'viewer.organ.tuy.name',
        descriptionKey: 'viewer.organ.tuy.description',
      },
      {
        nodeName: 'mieng',
        meshNames: ['digestive_system004'],
        displayNameKey: 'viewer.organ.mieng.name',
        descriptionKey: 'viewer.organ.mieng.description',
      },
    ])
  })

  it('every organ has locale keys in English and Vietnamese', () => {
    const tEn = createTranslator('en')
    const tVi = createTranslator('vi')

    for (const organ of ORGAN_LIST) {
      expect(tEn(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tEn(organ.descriptionKey)).not.toBe(organ.descriptionKey)
      expect(tVi(organ.displayNameKey)).not.toBe(organ.displayNameKey)
      expect(tVi(organ.descriptionKey)).not.toBe(organ.descriptionKey)
    }
  })

  it('logical organ ids are unique', () => {
    const names = ORGAN_LIST.map((organ) => organ.nodeName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('raw mesh names are unique', () => {
    const meshNames = ORGAN_LIST.flatMap((organ) => organ.meshNames)
    expect(new Set(meshNames).size).toBe(meshNames.length)
  })

  it('getOrganInfo returns organ by logical id', () => {
    const first = ORGAN_LIST[0]
    expect(getOrganInfo(first.nodeName)).toBe(first)
  })

  it('getOrganInfo returns undefined for unknown id', () => {
    expect(getOrganInfo('nonexistent')).toBeUndefined()
  })

  it('getOrganInfoByMeshName maps each mesh to its organ', () => {
    for (const organ of ORGAN_LIST) {
      for (const meshName of organ.meshNames) {
        expect(getOrganInfoByMeshName(meshName)?.nodeName).toBe(organ.nodeName)
      }
    }
  })

  it('ORGAN_NODE_NAMES contains all mesh names', () => {
    const expected = EXPECTED_ORGAN_MAPPING.flatMap((organ) => organ.meshNames)
    expect(ORGAN_NODE_NAMES).toEqual(new Set(expected))
  })
})
