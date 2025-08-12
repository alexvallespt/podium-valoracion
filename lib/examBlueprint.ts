
export type DDX = { label:string; prob:number }

export type OrthoTest = { key:string; label:string, cluster?:string }
export type NeuroTest = { key:string; label:string }
export type FunctionalTest = { key:string; label:string, unit?:string }

export type ExamBlueprint = {
  romRows: { key:string; label:string; refMin?:number; refMax?:number }[]
  strengthRows: { key:string; label:string }[]
  orthoTests: OrthoTest[]
  neuroTests: NeuroTest[]
  functional: FunctionalTest[]
  scaleIds: string[]
  notesHints: string[]
}

function norm(t:string){
  return t.toLowerCase()
}

function mapDDX(ddx:DDX[]): string[] {
  const tags:string[] = []
  ddx.forEach(d=>{
    const s = norm(d.label)
    if(/supraespinoso|rotador|manguito|tendinop/.test(s)) tags.push('rotator_cuff')
    if(/impingement|subacrom/.test(s)) tags.push('impingement')
    if(/capsulitis|adhesiva|congelado/.test(s)) tags.push('adhesive_capsulitis')
    if(/acromioclav|ac joint|acromio/.test(s)) tags.push('ac_joint')
    if(/cervic/.test(s) && /radic|refer/.test(s)) tags.push('cervical_radic')
    if(/patelar|rotuliana/.test(s)) tags.push('patellar_tendi')
    if(/menisc/.test(s)) tags.push('meniscus')
    if(/\bacl\b|cruzado anterior/i.test(d.label)) tags.push('acl')
    if(/patelofemoral|fesario/i.test(s) || /patelofemoral/.test(s)) tags.push('pfps')
    if(/aquiles|quíleo|achilles/.test(s)) tags.push('achilles_tendi')
    if(/esguince.*tobillo|lateral ankle sprain|talar tilt|ligament/i.test(s)) tags.push('ankle_sprain')
    if(/lumbar.*radic|ciat|l5|s1/i.test(s)) tags.push('lumbar_radic')
    if(/lumbalgia|dolor.*lumbar|n1s/.test(s)) tags.push('ns_lbp')
  })
  return Array.from(new Set(tags))
}

export function getExamBlueprint(bodyRegion:string|undefined|null, ddx:DDX[]|undefined|null): ExamBlueprint {
  const br = (bodyRegion||'').toLowerCase()
  const tags = mapDDX(ddx||[])

  const romRows:any[] = []
  const strengthRows:any[] = []
  const orthoTests:OrthoTest[] = []
  const neuroTests:NeuroTest[] = []
  const functional:FunctionalTest[] = []
  const scaleIds:string[] = []
  const notesHints:string[] = []

  // Region defaults
  if(/hombro/.test(br)){
    romRows.push(
      { key:'flex', label:'Flexión (°)', refMin:150, refMax:180 },
      { key:'abd', label:'Abducción (°)', refMin:150, refMax:180 },
      { key:'er', label:'Rotación externa (°)', refMin:70, refMax:90 },
      { key:'ir', label:'Rotación interna (°)', refMin:60, refMax:70 },
    )
    strengthRows.push(
      { key:'abd', label:'Abducción (kg)' },
      { key:'er', label:'Rotación externa (kg)' },
      { key:'ir', label:'Rotación interna (kg)' },
      { key:'flex', label:'Flexión (kg)' },
    )
    scaleIds.push('SPADI','DASH')
    functional.push({ key:'hand_to_neck', label:'Mano a nuca (Apley)' }, { key:'hand_to_back', label:'Mano a espalda (Apley)' })
    notesHints.push('Evalúa cintura escapular y control escapulotorácico.')
    if(tags.includes('rotator_cuff')||tags.includes('impingement')){
      orthoTests.push(
        { key:'jobe', label:'Jobe / Empty Can', cluster:'manguito' },
        { key:'hawkins', label:'Hawkins-Kennedy', cluster:'impingement' },
        { key:'painful_arc', label:'Arco doloroso', cluster:'impingement' },
        { key:'speeds', label:'Speed’s (porción larga bíceps)' }
      )
    }
    if(tags.includes('adhesive_capsulitis')){
      notesHints.push('Capsulitis: limitación capsular típica ER > ABD > FLEX. PROM también limitada.')
    }
    if(tags.includes('ac_joint')){
      orthoTests.push({ key:'cross_body', label:'Cross-body adduction (AC)' })
    }
    if(tags.includes('cervical_radic')){
      neuroTests.push({ key:'spurling', label:'Spurling' }, { key:'distraction', label:'Tracción cervical' }, { key:'ultt', label:'ULTT mediano' })
      scaleIds.push('NDI')
    }
  }

  if(/rodilla/.test(br)){
    romRows.push(
      { key:'flex', label:'Flexión (°)', refMin:130, refMax:150 },
      { key:'ext', label:'Extensión (°)', refMin:0, refMax:0 },
    )
    strengthRows.push(
      { key:'quad', label:'Cuádriceps (kg)' },
      { key:'ischio', label:'Isquiosurales (kg)' },
      { key:'abd', label:'Abductores cadera (kg)' },
      { key:'add', label:'Aductores cadera (kg)' },
    )
    functional.push({ key:'single_leg_squat', label:'Single-Leg Squat (calidad)' }, { key:'hop', label:'Single Hop (cm)' }, { key:'stair', label:'Subir/bajar escaleras' })
    scaleIds.push('LEFS', 'KOOS')
    if(tags.includes('patellar_tendi')){
      functional.push({ key:'decline_squat_pain', label:'Dolor en sentadilla declinada (0–10)', unit:'0-10' })
      scaleIds.push('VISA_P')
      notesHints.push('Evalúa cadena extensora y carga en pliometría progresiva.')
    }
    if(tags.includes('meniscus')){
      orthoTests.push({ key:'mcmurray', label:'McMurray' }, { key:'thessaly', label:'Thessaly' }, { key:'joint_line', label:'Dolor línea articular' })
    }
    if(tags.includes('acl')){
      orthoTests.push({ key:'lachman', label:'Lachman' }, { key:'ant_drawer', label:'Cajón anterior' }, { key:'pivot_shift', label:'Pivot shift' })
    }
    if(tags.includes('pfps')){
      orthoTests.push({ key:'clarke', label:'Clarke / Compresión patelar' })
    }
  }

  if(/tobillo|pie/.test(br)){
    romRows.push(
      { key:'df', label:'Dorsiflexión (°)', refMin:10, refMax:20 },
      { key:'pf', label:'Flexión plantar (°)', refMin:40, refMax:55 },
      { key:'inv', label:'Inversión (°)', refMin:30, refMax:35 },
      { key:'ev', label:'Eversión (°)', refMin:15, refMax:20 },
    )
    strengthRows.push(
      { key:'pf', label:'Flexores plantares (kg)' },
      { key:'df', label:'Dorsiflexores (kg)' },
      { key:'inv', label:'Inversores (kg)' },
      { key:'ev', label:'Eversores (kg)' },
    )
    functional.push({ key:'calf_raises', label:'Elevaciones de talón (reps)' }, { key:'hop', label:'Hop test (cm)' })
    scaleIds.push('FAAM','LEFS')
    if(tags.includes('achilles_tendi')){
      orthoTests.push({ key:'arc_sign', label:'Arc Sign' }, { key:'royal_london', label:'Royal London' })
      scaleIds.push('VISA_A')
      notesHints.push('Valora inclinación tibial/knee-to-wall para DF y carga excéntrica / tempo.')
    }
    if(tags.includes('ankle_sprain')){
      orthoTests.push({ key:'ant_drawer_ankle', label:'Cajón anterior tobillo' }, { key:'talar_tilt', label:'Talar tilt' })
    }
  }

  if(/cadera/.test(br)){
    romRows.push(
      { key:'flex', label:'Flexión (°)', refMin:110, refMax:125 },
      { key:'ext', label:'Extensión (°)', refMin:10, refMax:20 },
      { key:'abd', label:'Abducción (°)', refMin:30, refMax:45 },
      { key:'ir', label:'Rotación interna (°)', refMin:30, refMax:45 },
      { key:'er', label:'Rotación externa (°)', refMin:40, refMax:60 },
    )
    strengthRows.push(
      { key:'flex', label:'Flexores cadera (kg)' },
      { key:'ext', label:'Extensores cadera (kg)' },
      { key:'abd', label:'Abductores (kg)' },
      { key:'add', label:'Aductores (kg)' },
      { key:'rot', label:'Rotadores (kg)' },
    )
    functional.push({ key:'single_leg_squat', label:'Single-Leg Squat' }, { key:'sit_to_stand', label:'Sit-to-Stand (30s)' })
    scaleIds.push('HOOS','LEFS')
  }

  if(/cervical/.test(br)){
    romRows.push(
      { key:'flex', label:'Flexión (°)', refMin:40, refMax:60 },
      { key:'ext', label:'Extensión (°)', refMin:50, refMax:70 },
      { key:'rot', label:'Rotación (°)', refMin:60, refMax:80 },
      { key:'inc', label:'Inclinación lateral (°)', refMin:35, refMax:45 },
    )
    strengthRows.push(
      { key:'flex', label:'Flexores cervicales (kg)' },
      { key:'ext', label:'Extensores cervicales (kg)' },
      { key:'sb', label:'Inclinadores (kg)' },
      { key:'rot', label:'Rotadores (kg)' },
    )
    scaleIds.push('NDI')
    if(tags.includes('cervical_radic')){
      neuroTests.push({ key:'spurling', label:'Spurling' }, { key:'distraction', label:'Tracción cervical' }, { key:'ultt', label:'ULTT mediano' })
    }
  }

  if(/lumbar|torácica/.test(br)){
    romRows.push(
      { key:'flex', label:'Flexión (°)', refMin:40, refMax:60 },
      { key:'ext', label:'Extensión (°)', refMin:20, refMax:35 },
      { key:'rot', label:'Rotación (°)', refMin:5, refMax:15 },
      { key:'inc', label:'Inclinación lateral (°)', refMin:15, refMax:25 },
    )
    strengthRows.push(
      { key:'ext', label:'Extensores (kg)' },
      { key:'flex', label:'Flexores (kg)' },
      { key:'sb', label:'Inclinadores (kg)' },
      { key:'rot', label:'Rotadores (kg)' },
    )
    scaleIds.push('ODI')
    if(tags.includes('lumbar_radic')){
      neuroTests.push({ key:'slr', label:'SLR (Lasègue)' }, { key:'slump', label:'Slump' })
    }
    if(tags.includes('ns_lbp')){
      functional.push({ key:'prone_instability', label:'Prone Instability test' })
    }
  }

  return { romRows, strengthRows, orthoTests, neuroTests, functional, scaleIds: Array.from(new Set(scaleIds)), notesHints }
}
