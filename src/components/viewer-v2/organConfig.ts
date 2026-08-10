import type { TranslationKey } from '@/lib/i18n'

export interface OrganInfo {
  nodeName: string
  meshNames: string[]
  displayNameKey: TranslationKey
  descriptionKey: TranslationKey
}

export const ORGAN_LIST: OrganInfo[] = [
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
]

const ORGAN_INFO_BY_NODE_NAME = new Map(ORGAN_LIST.map((organ) => [organ.nodeName, organ]))
const ORGAN_INFO_BY_MESH_NAME = new Map(
  ORGAN_LIST.flatMap((organ) => organ.meshNames.map((meshName) => [meshName, organ] as const)),
)

export const ORGAN_NODE_NAMES = new Set(ORGAN_LIST.flatMap((organ) => organ.meshNames))

export function getOrganInfo(nodeName: string): OrganInfo | undefined {
  return ORGAN_INFO_BY_NODE_NAME.get(nodeName)
}

export function getOrganInfoByMeshName(meshName: string): OrganInfo | undefined {
  return ORGAN_INFO_BY_MESH_NAME.get(meshName)
}
