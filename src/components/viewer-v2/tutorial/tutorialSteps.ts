import type { TranslationKey } from '@/lib/i18n'

import type { ActiveDialog, ActiveSheet, ViewMode } from '../viewerV2Context'

export type TutorialPlacement = 'top' | 'right' | 'bottom' | 'left' | 'center'

export type TutorialAction =
  | { type: 'sheet'; value: ActiveSheet }
  | { type: 'dialog'; value: ActiveDialog }
  | { type: 'drawing'; value: boolean }
  | { type: 'menu'; value: boolean }
  | { type: 'reset' }
  | { type: 'viewMode'; value: ViewMode }

export interface TutorialStep {
  id: string
  targetId: string
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  audioFile: string
  placement: TutorialPlacement
  focusScale?: number
  action?: TutorialAction
}

export const VOICE_AUDIO_FOLDERS = {
  bac: 'Bắc',
  trung: 'Trung',
  nam: 'Nam',
} as const

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'viewer-area',
    targetId: 'viewer-area',
    titleKey: 'viewer.tutorial.steps.viewerArea.title',
    descriptionKey: 'viewer.tutorial.steps.viewerArea.description',
    audioFile: 'day_la_khu_vuc_de_tuong_tac_voi_mo_hinh_3d.mp3',
    placement: 'right',
    focusScale: 0.6,
    action: { type: 'reset' },
  },
  {
    id: 'menu-toggle',
    targetId: 'menu-toggle',
    titleKey: 'viewer.tutorial.steps.menuToggle.title',
    descriptionKey: 'viewer.tutorial.steps.menuToggle.description',
    audioFile: 'nut_dung_de_dongmo_thanh_menu.mp3',
    placement: 'right',
    action: { type: 'menu', value: true },
  },
  {
    id: 'rotate-model',
    targetId: 'menu-rotate',
    titleKey: 'viewer.tutorial.steps.rotateModel.title',
    descriptionKey: 'viewer.tutorial.steps.rotateModel.description',
    audioFile: 'nut_dung_de_xoay_mo_hinh.mp3',
    placement: 'right',
  },
  {
    id: 'fly-camera',
    targetId: 'menu-flyCamera',
    titleKey: 'viewer.tutorial.steps.flyCamera.title',
    descriptionKey: 'viewer.tutorial.steps.flyCamera.description',
    audioFile: 'nut_de_battat_che_do_trinh_chieu.mp3',
    placement: 'right',
  },
  {
    id: 'model-color',
    targetId: 'menu-modelColor',
    titleKey: 'viewer.tutorial.steps.modelColor.title',
    descriptionKey: 'viewer.tutorial.steps.modelColor.description',
    audioFile: 'nut_de_doi_mau_mo_hinh.mp3',
    placement: 'right',
  },
  {
    id: 'background-color',
    targetId: 'menu-backgroundColor',
    titleKey: 'viewer.tutorial.steps.backgroundColor.title',
    descriptionKey: 'viewer.tutorial.steps.backgroundColor.description',
    audioFile: 'nut_dung_de_doi_mau_nen.mp3',
    placement: 'right',
  },
  {
    id: 'quiz',
    targetId: 'menu-quiz',
    titleKey: 'viewer.tutorial.steps.quiz.title',
    descriptionKey: 'viewer.tutorial.steps.quiz.description',
    audioFile: 'nut_tao_cau_hoi_trac_nghiem_bang_ay_ai.mp3',
    placement: 'right',
  },
  {
    id: 'info',
    targetId: 'info-panel',
    titleKey: 'viewer.tutorial.steps.info.title',
    descriptionKey: 'viewer.tutorial.steps.info.description',
    audioFile: 'cung_cap_thong_tin_ve_mo_hinh.mp3',
    placement: 'left',
    action: { type: 'dialog', value: 'info' },
  },
  {
    id: 'video',
    targetId: 'menu-video',
    titleKey: 'viewer.tutorial.steps.video.title',
    descriptionKey: 'viewer.tutorial.steps.video.description',
    audioFile: 'nut_dung_de_mo_video_bai_giang.mp3',
    placement: 'right',
  },
  {
    id: 'genai',
    targetId: 'menu-genai',
    titleKey: 'viewer.tutorial.steps.genai.title',
    descriptionKey: 'viewer.tutorial.steps.genai.description',
    audioFile: 'dung_ai_de_giai_thich_thong_tin_ve_mo_hinh.mp3',
    placement: 'right',
    action: { type: 'dialog', value: null },
  },
  {
    id: 'chatbot',
    targetId: 'menu-chatbot',
    titleKey: 'viewer.tutorial.steps.chatbot.title',
    descriptionKey: 'viewer.tutorial.steps.chatbot.description',
    audioFile: 'nut_dung_de_mo_phan_chat_bot.mp3',
    placement: 'right',
  },
  {
    id: 'annotation',
    targetId: 'annotation-toolbar',
    titleKey: 'viewer.tutorial.steps.annotation.title',
    descriptionKey: 'viewer.tutorial.steps.annotation.description',
    audioFile: 'nut_de_battat_che_do_ve_chu_thich.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
  {
    id: 'draw-color',
    targetId: 'annotation-color',
    titleKey: 'viewer.tutorial.steps.drawColor.title',
    descriptionKey: 'viewer.tutorial.steps.drawColor.description',
    audioFile: 'bang_mau_dung_de_thay_doi_mau_net_ve.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
  {
    id: 'annotation-eraser',
    targetId: 'annotation-eraser',
    titleKey: 'viewer.tutorial.steps.annotationEraser.title',
    descriptionKey: 'viewer.tutorial.steps.annotationEraser.description',
    audioFile: 'nut_dung_de_boi_xoa_net_ve.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
  {
    id: 'annotation-clear',
    targetId: 'annotation-clear',
    titleKey: 'viewer.tutorial.steps.annotationClear.title',
    descriptionKey: 'viewer.tutorial.steps.annotationClear.description',
    audioFile: 'nut_de_lam_moi_trong_ve_ghi_chu.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
  {
    id: 'screenshot',
    targetId: 'menu-screenshot',
    titleKey: 'viewer.tutorial.steps.screenshot.title',
    descriptionKey: 'viewer.tutorial.steps.screenshot.description',
    audioFile: 'nut_dung_de_chup_man_hinh.mp3',
    placement: 'right',
    action: { type: 'drawing', value: false },
  },
  {
    id: 'editor',
    targetId: 'menu-editor',
    titleKey: 'viewer.tutorial.steps.editor.title',
    descriptionKey: 'viewer.tutorial.steps.editor.description',
    audioFile: 'nut_dung_de_mo_trinh_soan_thao_giao_an_bai_giang.mp3',
    placement: 'right',
  },
  {
    id: 'settings',
    targetId: 'settings-panel',
    titleKey: 'viewer.tutorial.steps.settings.title',
    descriptionKey: 'viewer.tutorial.steps.settings.description',
    audioFile: 'nut_dung_de_mo_bang_thiet_lap.mp3',
    placement: 'left',
    action: { type: 'sheet', value: 'settings' },
  },
  {
    id: 'fullscreen',
    targetId: 'menu-fullscreen',
    titleKey: 'viewer.tutorial.steps.fullscreen.title',
    descriptionKey: 'viewer.tutorial.steps.fullscreen.description',
    audioFile: 'nut_dung_de_thay_doi_kich_thuoc_man_hinh.mp3',
    placement: 'right',
    action: { type: 'sheet', value: null },
  },
  {
    id: 'home',
    targetId: 'menu-home',
    titleKey: 'viewer.tutorial.steps.home.title',
    descriptionKey: 'viewer.tutorial.steps.home.description',
    audioFile: 'nut_de_quay_tro_lai_man_hinh_chinh.mp3',
    placement: 'right',
  },
  {
    id: 'view-mode',
    targetId: 'view-mode',
    titleKey: 'viewer.tutorial.steps.viewMode.title',
    descriptionKey: 'viewer.tutorial.steps.viewMode.description',
    audioFile: 'thay_doi_che_do_xem_3d_hoac_2d.mp3',
    placement: 'left',
    action: { type: 'viewMode', value: '3d' },
  },
  {
    id: 'reset-view',
    targetId: 'view-reset',
    titleKey: 'viewer.tutorial.steps.resetView.title',
    descriptionKey: 'viewer.tutorial.steps.resetView.description',
    audioFile: 'nut_dung_de_dua_khung_hinh_ve_vi_tri_cu.mp3',
    placement: 'left',
  },
]

export function getTutorialAudioSrc(voice: keyof typeof VOICE_AUDIO_FOLDERS, audioFile: string) {
  return `/audios/Tutorial/${VOICE_AUDIO_FOLDERS[voice]}/${audioFile}`
}
