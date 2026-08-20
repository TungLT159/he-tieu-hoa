import { describe, expect, it } from 'vitest'

import { getTutorialAudioSrc, TUTORIAL_STEPS } from '../tutorialSteps'

describe('tutorialSteps', () => {
  it('defines stable tutorial targets for the guide walkthrough', () => {
    expect(TUTORIAL_STEPS.map((step) => step.targetId)).toEqual([
      'viewer-area',
      'menu-toggle',
      'menu-rotate',
      'menu-flyCamera',
      'menu-modelColor',
      'menu-backgroundColor',
      'menu-quiz',
      'info-panel',
      'menu-video',
      'menu-genai',
      'menu-chatbot',
      'annotation-toolbar',
      'annotation-color',
      'annotation-eraser',
      'annotation-clear',
      'menu-screenshot',
      'menu-editor',
      'settings-panel',
      'menu-fullscreen',
      'menu-home',
      'view-mode',
      'view-reset',
    ])
  })

  it('builds audio paths for each supported voice region', () => {
    const file = 'nut_dung_de_xoay_mo_hinh.mp3'

    expect(getTutorialAudioSrc('bac', file)).toBe('/audios/Tutorial/Bắc/nut_dung_de_xoay_mo_hinh.mp3')
    expect(getTutorialAudioSrc('trung', file)).toBe('/audios/Tutorial/Trung/nut_dung_de_xoay_mo_hinh.mp3')
    expect(getTutorialAudioSrc('nam', file)).toBe('/audios/Tutorial/Nam/nut_dung_de_xoay_mo_hinh.mp3')
  })
})
