/**
 * 【手写内容区】B-1 刑诉口诀卡（T03 批次）
 * 依据 2026 年公开备考资料整理，以司法部官方公告与现行有效法律法规为准。
 * 全部条目为自编学习笔记（口诀短句为自创助记词，展开为自述归纳），非任何教材原文摘录。
 * 结构契约：ARCH §4.3 MnemonicCard（clauseIndex 为 string[]，U-2 裁决）
 */
export default [
  /* ================= 管辖与回避 ================= */
  {
    id: 'mn-crimpro-001', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '中院管：国恐无死', scenario: '刑事一审级别管辖',
    points: [
      { k: '国安', v: '危害国家安全案件的一审由中级人民法院管辖' },
      { k: '恐', v: '恐怖活动案件的一审由中级人民法院管辖' },
      { k: '无死', v: '可能判处无期徒刑、死刑的案件由中级人民法院管辖' }
    ],
    clauseIndex: ['刑诉法 20', '刑诉法 21'],
    level: 'S',
    tip: '基层法院管辖其余一切一审案件；级别管辖只升不降，上级认为必要时可审判下级管辖案件。'
  },
  {
    id: 'mn-crimpro-002', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '犯罪地优先，居住地兜底', scenario: '地域管辖的确定顺序',
    points: [
      { k: '犯罪地', v: '犯罪行为发生地与结果发生地法院管辖为原则' },
      { k: '居住地', v: '被告人居住地法院审判更为适宜的，可以由居住地法院管辖' }
    ],
    clauseIndex: ['刑诉法 25'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-003', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '几个同级都可管，先受理者主审', scenario: '同级法院管辖竞合',
    points: [
      { k: '最初受理', v: '几个同级法院都有权管辖时，由最初受理的法院审判' },
      { k: '移送主要', v: '必要时（主要犯罪地更适宜）可移送主要犯罪地法院审判' }
    ],
    clauseIndex: ['刑诉法 25'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-004', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '管辖不明找共同上级', scenario: '指定管辖',
    points: [
      { k: '不明', v: '管辖不明的，可协商；协商不成，报请共同上级法院指定' },
      { k: '不宜', v: '有管辖权但因回避等原因不宜行使的，可请求移送上一级法院指定管辖' }
    ],
    clauseIndex: ['刑诉法 27'],
    level: 'B'
  },
  {
    id: 'mn-crimpro-005', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '近亲利害，参过前案', scenario: '回避法定事由',
    points: [
      { k: '近亲利害', v: '本人或其近亲属与案件有利害关系，可能影响公正处理' },
      { k: '参过前案', v: '担任过本案的证人、鉴定人、辩护人、诉讼代理人或翻译' },
      { k: '请吃请托', v: '接受当事人及其委托人的请客送礼，或违反规定会见其代理人' }
    ],
    clauseIndex: ['刑诉法 29', '刑诉法 30'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-006', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '一般找负责人，领导找委员会', scenario: '回避决定权的层级',
    points: [
      { k: '审判人员', v: '审判人员、书记员的回避由院长决定；院长的回避由本院审判委员会决定' },
      { k: '检察人员', v: '检察人员的回避由检察长决定；检察长的回避由检察委员会决定' },
      { k: '侦查人员', v: '侦查人员的回避由公安机关负责人决定；公安负责人的回避由同级检察院检察委员会决定' }
    ],
    clauseIndex: ['刑诉法 31'],
    level: 'S',
    tip: '检察委员会、审判委员会讨论时，被申请回避者本人不得参加。'
  },
  {
    id: 'mn-crimpro-007', kind: 'mnemonic', subject: 'crim-proc', chapter: '管辖与回避',
    mnemonic: '侦查不因回避停', scenario: '回避决定前的效力',
    points: [
      { k: '暂停', v: '被申请回避的审判人员、检察人员，在决定作出前应暂停参与本案' },
      { k: '不停', v: '对侦查人员的回避作出决定前，侦查人员不能停止对案件的侦查' }
    ],
    clauseIndex: ['刑诉法 31'],
    level: 'A'
  },
  /* ================= 辩护与代理 ================= */
  {
    id: 'mn-crimpro-008', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '侦查阶段只能请律师', scenario: '委托辩护人的时间与身份限制',
    points: [
      { k: '全程可托', v: '犯罪嫌疑人自被侦查机关第一次讯问或采取强制措施之日起即可委托' },
      { k: '身份限制', v: '侦查期间只能委托律师作为辩护人' }
    ],
    clauseIndex: ['刑诉法 33', '刑诉法 34'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-009', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '盲精无死，通知法援', scenario: '应当通知法律援助机构指派律师辩护',
    points: [
      { k: '盲聋哑', v: '犯罪嫌疑人是盲、聋、哑人的' },
      { k: '半疯', v: '尚未完全丧失辨认或控制自己行为能力的精神病人' },
      { k: '无死', v: '可能被判处无期徒刑、死刑的' }
    ],
    clauseIndex: ['刑诉法 35', '刑诉法 278'],
    level: 'S',
    tip: '未成年人没有委托辩护人的，同样应当通知法援（刑诉法 278）。'
  },
  {
    id: 'mn-crimpro-010', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '值班律师给帮助，不是辩护人', scenario: '值班律师的职责边界',
    points: [
      { k: '能做', v: '提供法律咨询、程序选择建议、对案件处理提出意见等法律帮助' },
      { k: '不能', v: '不担任辩护人，不出庭辩护，不享有辩护人的完整诉讼权利' }
    ],
    clauseIndex: ['刑诉法 36'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-011', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '三证会见，国恐要许可', scenario: '辩护律师会见在押嫌疑人',
    points: [
      { k: '三证', v: '凭律师执业证书、律所证明、委托书或法援公函要求会见，看守所应当及时安排，至迟不超过四十八小时' },
      { k: '许可类', v: '危害国家安全犯罪、恐怖活动犯罪案件，侦查期间会见须经侦查机关许可' }
    ],
    clauseIndex: ['刑诉法 39'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-012', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '审查起诉起，阅卷无障碍', scenario: '辩护人阅卷权的时间起点',
    points: [
      { k: '起点', v: '检察院对案件审查起诉之日起，辩护律师可以查阅、摘抄、复制本案案卷材料' },
      { k: '范围', v: '其他辩护人经法院、检察院许可也可阅卷' }
    ],
    clauseIndex: ['刑诉法 40'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-013', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '无罪罪轻可申请调取', scenario: '辩护人申请调取未提交的证据',
    points: [
      { k: '情形', v: '辩护人认为侦查、审查起诉期间公安或检察院收集的证明无罪、罪轻的证据材料未提交的' },
      { k: '方式', v: '有权申请检察院、法院调取有关证据' }
    ],
    clauseIndex: ['刑诉法 41'],
    level: 'B'
  },
  {
    id: 'mn-crimpro-014', kind: 'mnemonic', subject: 'crim-proc', chapter: '辩护与代理',
    mnemonic: '向被害人方取证，两许可加同意', scenario: '辩护律师调查取证的限制',
    points: [
      { k: '证人方', v: '经证人或其他有关单位和个人同意，可向其收集证据材料' },
      { k: '被害人方', v: '向被害人或其近亲属、被害人提供的证人收集，须经法院或检察院许可，且经被害人方同意' }
    ],
    clauseIndex: ['刑诉法 43'],
    level: 'A'
  },
  /* ================= 证据 ================= */
  {
    id: 'mn-crimpro-015', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '物书言陈供，鉴笔视听电', scenario: '法定证据种类（八类）',
    points: [
      { k: '物书', v: '物证；书证' },
      { k: '言陈供', v: '证人证言；被害人陈述；犯罪嫌疑人、被告人供述和辩解' },
      { k: '鉴笔', v: '鉴定意见；勘验、检查、辨认、侦查实验等笔录' },
      { k: '视听电', v: '视听资料、电子数据' }
    ],
    clauseIndex: ['刑诉法 50'],
    level: 'S',
    tip: '鉴定意见只能"意见"不能"结论"；辨认笔录独立于勘验笔录。'
  },
  {
    id: 'mn-crimpro-016', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '谁指控谁举证', scenario: '刑事举证责任的分配',
    points: [
      { k: '公诉案', v: '公诉案件中被告人有罪的举证责任由人民检察院承担' },
      { k: '自诉案', v: '自诉案件中被告人有罪的举证责任由自诉人承担' }
    ],
    clauseIndex: ['刑诉法 51'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-017', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '不得强迫自证其罪', scenario: '收集证据的禁止性要求',
    points: [
      { k: '告知义务', v: '侦查人员讯问时应当告知犯罪嫌疑人享有的诉讼权利、如实供述可从宽处理及认罪认罚的法律规定' },
      { k: '禁止', v: '严禁刑讯逼供和以威胁、引诱、欺骗等非法方法收集证据' }
    ],
    clauseIndex: ['刑诉法 52', '刑诉法 120'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-018', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '言词绝对排，实物可补正', scenario: '非法证据排除的双轨规则',
    points: [
      { k: '言词证据', v: '采用刑讯逼供等非法方法收集的言词证据，应当一律排除' },
      { k: '实物证据', v: '违反法定程序收集的物证、书证，可能严重影响司法公正的，应补正或作出合理解释；不能补正或解释不合理的，才排除' }
    ],
    clauseIndex: ['刑诉法 54', '刑诉法 56'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-019', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '定罪三关：有证、查实、无怀疑', scenario: '证据确实、充分的标准',
    points: [
      { k: '有证', v: '定罪量刑的事实都有证据证明' },
      { k: '查实', v: '据以定案的证据均经法定程序查证属实' },
      { k: '无怀疑', v: '综合全案证据，对所认定事实已排除合理怀疑' }
    ],
    clauseIndex: ['刑诉法 55'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-020', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '当事人申请，法庭调查', scenario: '非法证据排除的启动方式',
    points: [
      { k: '申请', v: '当事人及其辩护人、诉讼代理人有权申请排除非法证据，申请应提供相关线索或材料' },
      { k: '职权', v: '法庭对证据收集的合法性有疑问的，应当进行法庭调查' },
      { k: '检察核实', v: '检察院接到报案、控告、举报或发现侦查人员以非法方法收集证据的，应当进行调查核实' }
    ],
    clauseIndex: ['刑诉法 56', '刑诉法 57'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-021', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '异议加重大，证人须出庭', scenario: '证人应当出庭作证的条件',
    points: [
      { k: '条件', v: '控辩一方对证人证言有异议，且该证言对定罪量刑有重大影响，法院认为有必要出庭的' },
      { k: '警察出庭', v: '人民警察就其执行职务时目击的犯罪情况，可作为证人出庭作证' },
      { k: '鉴定人', v: '鉴定人拒不出庭作证的，鉴定意见不得作为定案根据' }
    ],
    clauseIndex: ['刑诉法 192'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-022', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '国恐黑毒，保护证人', scenario: '证人保护的适用范围',
    points: [
      { k: '四类案件', v: '危害国家安全犯罪、恐怖活动犯罪、黑社会性质的组织犯罪、毒品犯罪' },
      { k: '条件', v: '证人、鉴定人、被害人因在诉讼中作证，本人或近亲属人身安全面临危险的' },
      { k: '措施', v: '不公开个人信息、禁止特定人员接触、专门人员保护、住宅防护等' }
    ],
    clauseIndex: ['刑诉法 62'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-023', kind: 'mnemonic', subject: 'crim-proc', chapter: '证据',
    mnemonic: '作证有补助，费用国家担', scenario: '证人作证保障制度',
    points: [
      { k: '补助', v: '证人因履行作证义务而支出的交通、住宿、就餐等费用，应当给予补助' },
      { k: '单位义务', v: '证人所在单位不得克扣其工资、奖金及其他福利待遇' }
    ],
    clauseIndex: ['刑诉法 63'],
    level: 'B'
  },
  /* ================= 强制措施 ================= */
  {
    id: 'mn-crimpro-024', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '管独有危，病孕到期', scenario: '可以取保候审的四种情形',
    points: [
      { k: '管独', v: '可能判处管制、拘役或独立适用附加刑的' },
      { k: '有危', v: '可能判处有期徒刑以上刑罚，采取取保候审不致发生社会危险性的' },
      { k: '病孕', v: '患有严重疾病、生活不能自理，或怀孕、哺乳自己婴儿的妇女，采取取保不致发生社会危险性的' },
      { k: '到期', v: '羁押期限届满，案件尚未办结，需要采取取保候审的' }
    ],
    clauseIndex: ['刑诉法 67', '刑诉法 71'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-025', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '符合逮捕有特殊，方可监视居住', scenario: '监视居住的适用前提',
    points: [
      { k: '前提', v: '符合逮捕条件且有法定特殊情形（重病不能自理、孕哺、系不能自理者的唯一扶养人、案件特殊更适宜、期限届满未办结）' },
      { k: '住所执行', v: '原则上在住处执行；无固定住处的，在指定居所执行；指定居所监视居住不得在羁押场所、专门的办案场所执行' },
      { k: '折抵', v: '指定居所监视居住的期限应当折抵刑期（二日折一日徒刑）' }
    ],
    clauseIndex: ['刑诉法 74', '刑诉法 76'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-026', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '有事实、够徒刑、还有危险', scenario: '逮捕的三要件',
    points: [
      { k: '证据要件', v: '有证据证明有犯罪事实' },
      { k: '刑罚要件', v: '可能判处徒刑以上刑罚' },
      { k: '危险性要件', v: '采取取保候审尚不足以防止发生社会危险性，而有逮捕必要' }
    ],
    clauseIndex: ['刑诉法 79', '刑诉法 80'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-027', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '批捕归检察，执行归公安', scenario: '逮捕的批准权与执行权分离',
    points: [
      { k: '批准决定', v: '逮捕必须经人民检察院批准或者人民法院决定' },
      { k: '执行', v: '一律由公安机关执行' }
    ],
    clauseIndex: ['刑诉法 80'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-028', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '现行指认身边证，自杀逃跑毁串供，身份不明流结伙', scenario: '刑事拘留的七种情形',
    points: [
      { k: '现行发觉', v: '正在预备犯罪、实行犯罪或者在犯罪后即时被发觉的' },
      { k: '指认', v: '被害人或者在场亲眼看见的人指认他犯罪的' },
      { k: '身边证', v: '在身边或者住处发现有犯罪证据的' },
      { k: '自杀逃跑', v: '犯罪后企图自杀、逃跑或者在逃的' },
      { k: '毁串供', v: '有毁灭、伪造证据或者串供可能的' },
      { k: '身份不明', v: '不讲真实姓名、住址，身份不明的' },
      { k: '流结伙', v: '有流窜作案、多次作案、结伙作案重大嫌疑的' }
    ],
    clauseIndex: ['刑诉法 82'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-029', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '三加一至四，流结伙三十，检察七日定', scenario: '拘留后提请批捕与审查期限',
    points: [
      { k: '一般', v: '拘留后三日内提请批捕，可延长一至四日（最长七日）' },
      { k: '流结伙', v: '流窜作案、多次作案、结伙作案的重大嫌疑分子，提请批捕时间可延长至三十日' },
      { k: '检察决定', v: '检察院应当在七日以内作出批准或不批准逮捕的决定' },
      { k: '合计', v: '一般情形最长十四日，流窜多次结伙最长三十七日' }
    ],
    clauseIndex: ['刑诉法 91'],
    level: 'S',
    tip: '"37天"=公安提请30日+检察院7日，仅适用于流窜、多次、结伙作案。'
  },
  {
    id: 'mn-crimpro-030', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '逮捕之后，仍查羁押必要性', scenario: '羁押必要性审查',
    points: [
      { k: '主体', v: '犯罪嫌疑人、被告人被逮捕后，人民检察院仍应对羁押必要性进行审查' },
      { k: '建议', v: '经审查不需要继续羁押的，应当建议予以释放或者变更强制措施，有关机关应在十日以内将处理情况通知检察院' }
    ],
    clauseIndex: ['刑诉法 95'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-031', kind: 'mnemonic', subject: 'crim-proc', chapter: '强制措施',
    mnemonic: '期限届满必放人', scenario: '强制措施法定期限届满的处理',
    points: [
      { k: '释放解除', v: '强制措施法定期限届满的，应当释放、解除取保候审、监视居住或依法变更强制措施' },
      { k: '申请权', v: '犯罪嫌疑人、被告人及其法定代理人、近亲属或辩护人有权申请解除强制措施' }
    ],
    clauseIndex: ['刑诉法 97'],
    level: 'B'
  },
  /* ================= 侦查 ================= */
  {
    id: 'mn-crimpro-032', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '在押进看守所，讯问不出所', scenario: '讯问地点的强制要求',
    points: [
      { k: '在押', v: '犯罪嫌疑人被送交看守所羁押以后，侦查人员对其进行讯问，应当在看守所内进行' },
      { k: '不在押', v: '对不需要拘留、逮捕的，可传唤到指定地点或到其住处讯问，并应出示证明文件' }
    ],
    clauseIndex: ['刑诉法 119'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-033', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '传唤十二，重大二十四', scenario: '传唤、拘传的时长限制',
    points: [
      { k: '一般', v: '传唤、拘传持续的时间不得超过十二小时' },
      { k: '重大', v: '案情特别重大、复杂，需要采取拘留、逮捕措施的，不得超过二十四小时' },
      { k: '禁止', v: '不得以连续传唤、拘传的形式变相拘禁犯罪嫌疑人' }
    ],
    clauseIndex: ['刑诉法 119'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-034', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '无期死刑重大案，讯问全程要录音', scenario: '讯问录音录像的强制情形',
    points: [
      { k: '应当', v: '侦查人员在讯问犯罪嫌疑人的时候，可能判处无期徒刑、死刑的案件或者其他重大犯罪案件，应当对讯问过程进行录音或者录像' },
      { k: '完整', v: '录音录像应当对每一次讯问全程进行，保持完整性' }
    ],
    clauseIndex: ['刑诉法 123'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-035', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '嫌疑人可强制检查，被害人只能自愿', scenario: '人身检查的界限',
    points: [
      { k: '生物样本', v: '为了确定某些特征、伤情或生理状态，可以对犯罪嫌疑人提取指纹信息、采集血液尿液等生物样本' },
      { k: '强制', v: '犯罪嫌疑人拒绝检查的，侦查人员认为必要时可以强制检查' },
      { k: '被害人', v: '检查妇女的身体，应当由女工作人员或医师进行；对被害人不得强制检查' }
    ],
    clauseIndex: ['刑诉法 132'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-036', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '搜查要证，紧急例外', scenario: '搜查证的例外情形',
    points: [
      { k: '原则', v: '进行搜查，必须向被搜查人出示搜查证' },
      { k: '例外', v: '在执行逮捕、拘留的时候，遇有紧急情况，不用搜查证也可以进行搜查' }
    ],
    clauseIndex: ['刑诉法 138'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-037', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '国恐黑毒重侵犯，技术侦查有门槛', scenario: '技术侦查措施的适用范围',
    points: [
      { k: '公安适用', v: '危害国家安全犯罪、恐怖活动犯罪、黑社会性质的组织犯罪、重大毒品犯罪或者其他严重危害社会的犯罪案件' },
      { k: '检察适用', v: '人民检察院对利用职权实施的严重侵犯公民人身权利的重大犯罪案件，按需采取技侦措施，按规定交有关机关执行' },
      { k: '期限', v: '批准决定自签发之日起三个月以内有效，可继续批准延长，每次不超过三个月' }
    ],
    clauseIndex: ['刑诉法 150', '刑诉法 151'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-038', kind: 'mnemonic', subject: 'crim-proc', chapter: '侦查',
    mnemonic: '二加一，再二再二', scenario: '侦查羁押期限的三级延长',
    points: [
      { k: '基期', v: '对犯罪嫌疑人逮捕后的侦查羁押期限不得超过二个月' },
      { k: '一延', v: '案情复杂、期限届满不能终结的，经上一级检察院批准延长一个月' },
      { k: '二延', v: '四类重大复杂案件（边远地区重大复杂、重大犯罪集团、流窜作案重大复杂、犯罪涉及面广取证困难），经省级检察院批准延长二个月' },
      { k: '三延', v: '对可能判处十年有期徒刑以上刑罚的，经省级检察院批准或决定再延长二个月' }
    ],
    clauseIndex: ['刑诉法 156', '刑诉法 158', '刑诉法 159'],
    level: 'S',
    tip: '特殊原因还需延长的，由最高检报请全国人大常委会批准延期审理。'
  },
  /* ================= 起诉 ================= */
  {
    id: 'mn-crimpro-039', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '审查一月可延半月', scenario: '审查起诉期限',
    points: [
      { k: '基期', v: '检察院对于监察机关、公安机关移送起诉的案件，应当在一个月以内作出决定' },
      { k: '延长', v: '重大、复杂的案件，可以延长十五日' },
      { k: '认罪认罚', v: '认罪认罚且适用速裁程序的，应当在十日以内作出决定；对可能判处的有期徒刑超过一年的，可延长至十五日' }
    ],
    clauseIndex: ['刑诉法 172'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-040', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '退查两次，每次一月，重起算', scenario: '审查起诉阶段的补充侦查',
    points: [
      { k: '次数', v: '检察院审查案件，可以要求公安机关提供法庭审判所必需的证据；认为需要补充侦查的，可退回补充侦查，也可以自行侦查' },
      { k: '限制', v: '补充侦查以二次为限，每次不得超过一个月' },
      { k: '重算', v: '补充侦查完毕移送检察院后，检察院重新计算审查起诉期限' }
    ],
    clauseIndex: ['刑诉法 171'],
    level: 'S',
    tip: '二次补充侦查后检察院仍认为证据不足、不符合起诉条件的，应当作出不起诉决定。'
  },
  {
    id: 'mn-crimpro-041', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '法定酌定加存疑', scenario: '不起诉的三种类型',
    points: [
      { k: '法定', v: '具有法定不追诉情形（刑诉法16条）或没有犯罪事实的，应当不起诉' },
      { k: '酌定', v: '犯罪情节轻微，依照刑法规定不需要判处刑罚或者免除刑罚的，可以不起诉' },
      { k: '存疑', v: '对于二次补充侦查的案件，仍然证据不足、不符合起诉条件的，应当不起诉' }
    ],
    clauseIndex: ['刑诉法 16', '刑诉法 177'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-042', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '公安复议复核，被害人申诉或自诉', scenario: '不起诉决定的两条救济线',
    points: [
      { k: '公安', v: '公安机关认为不起诉决定有错误的，可以要求复议；意见不被接受的，可以向上一级检察院提请复核' },
      { k: '被害人', v: '被害人可在七日内向上一级检察院申诉，请求提起公诉；也可以不经申诉，直接向法院起诉（公诉转自诉）' },
      { k: '被不起诉人', v: '被不起诉人不服酌定不起诉的，可在七日内向检察院申诉' }
    ],
    clauseIndex: ['刑诉法 179', '刑诉法 180'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-043', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '具结书要律师在场', scenario: '认罪认罚具结书的签署',
    points: [
      { k: '在场', v: '犯罪嫌疑人自愿认罪认罚并同意量刑建议和程序适用的，应当在辩护人或者值班律师在场的情况下签署认罪认罚具结书' },
      { k: '免签情形', v: '犯罪嫌疑人是盲聋哑人，或尚未完全丧失辨认、控制能力的精神病人的，不需要签署具结书' }
    ],
    clauseIndex: ['刑诉法 173', '刑诉法 174'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-044', kind: 'mnemonic', subject: 'crim-proc', chapter: '起诉',
    mnemonic: '认罪认罚，随案带量刑建议', scenario: '检察院的量刑建议义务',
    points: [
      { k: '内容', v: '检察院提起公诉时，对认罪认罚案件应当就主刑、附加刑、是否适用缓刑等提出量刑建议' },
      { k: '一并移送', v: '并随案移送认罪认罚具结书等材料' }
    ],
    clauseIndex: ['刑诉法 176'],
    level: 'A'
  },
  /* ================= 审判：一审 ================= */
  {
    id: 'mn-crimpro-045', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '庭前会议只谈程序', scenario: '庭前会议的功能定位',
    points: [
      { k: '事项', v: '就回避、出庭证人名单、非法证据排除等程序性问题了解情况、听取意见' },
      { k: '启动', v: '审判人员可以召集；当事人、辩护人等申请排除非法证据的，应当召开庭前会议' }
    ],
    clauseIndex: ['刑诉法 187'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-046', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '国密隐私一律不公开，商秘申请可不开', scenario: '不公开审理的情形',
    points: [
      { k: '一律不公开', v: '涉及国家秘密或者个人隐私的案件，不公开审理' },
      { k: '可申请不公开', v: '涉及商业秘密，当事人提出申请的，可以不公开审理' },
      { k: '未成年', v: '审判时不满十八周岁的案件，一律不公开审理' }
    ],
    clauseIndex: ['刑诉法 188', '刑诉法 285'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-047', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '一审三加三，特殊报最高', scenario: '公诉一审案件审限',
    points: [
      { k: '基期', v: '应当在受理后二个月以内宣判，至迟不得超过三个月' },
      { k: '一延', v: '可能判处死刑的案件或者附带民事诉讼的案件，以及有法定四类情形的，经上一级法院批准可延长三个月' },
      { k: '二延', v: '因特殊情况还需要延长的，报请最高人民法院批准' }
    ],
    clauseIndex: ['刑诉法 208'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-048', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '有罪、无罪、存疑无', scenario: '一审判决的三种形态',
    points: [
      { k: '有罪', v: '案件事实清楚，证据确实、充分，依据法律认定被告人有罪的，作出有罪判决' },
      { k: '无罪', v: '依据法律认定被告人无罪的，作出无罪判决' },
      { k: '存疑无', v: '证据不足，不能认定被告人有罪的，作出证据不足、指控的犯罪不能成立的无罪判决' }
    ],
    clauseIndex: ['刑诉法 200'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-049', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '简易三条件：清楚、认罪、无异议', scenario: '简易程序的适用条件',
    points: [
      { k: '事实', v: '案件事实清楚、证据充分' },
      { k: '认罪', v: '被告人承认自己所犯罪行，对指控的犯罪事实没有异议' },
      { k: '程序同意', v: '被告人对适用简易程序没有异议' }
    ],
    clauseIndex: ['刑诉法 214', '刑诉法 215'],
    level: 'S',
    tip: '盲聋哑、精神病人、重大社会影响、无罪辩护等情形不得适用简易程序。'
  },
  {
    id: 'mn-crimpro-050', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '简易二十，三年一点五', scenario: '简易程序的审限',
    points: [
      { k: '基期', v: '适用简易程序审理案件，人民法院应当在受理后二十日以内审结' },
      { k: '延长', v: '对可能判处的有期徒刑超过三年的，可以延长至一个半月' }
    ],
    clauseIndex: ['刑诉法 220'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-051', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '基层三年下，认罚同速裁', scenario: '速裁程序的适用条件',
    points: [
      { k: '法院', v: '由基层人民法院管辖' },
      { k: '刑罚', v: '可能判处三年有期徒刑以下刑罚' },
      { k: '证据', v: '案件事实清楚，证据确实、充分' },
      { k: '同意', v: '被告人认罪认罚并同意适用速裁程序' }
    ],
    clauseIndex: ['刑诉法 222', '刑诉法 223'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-052', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·一审',
    mnemonic: '速裁不调查不辩论，应当当庭宣判', scenario: '速裁程序的审理方式',
    points: [
      { k: '简化', v: '不再进行法庭调查、法庭辩论' },
      { k: '宣判', v: '审理时应当听取辩护人意见和被告人最后陈述；应当当庭宣判' },
      { k: '审限', v: '十日以内审结；可能判处有期徒刑超过一年的，可延长至十五日' },
      { k: '转化', v: '不宜适用速裁的，应转为普通程序或简易程序重新审理' }
    ],
    clauseIndex: ['刑诉法 224', '刑诉法 225'],
    level: 'S'
  },
  /* ================= 审判：二审 ================= */
  {
    id: 'mn-crimpro-053', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '判十裁五，次日起算', scenario: '上诉、抗诉的期限',
    points: [
      { k: '判决', v: '不服判决的上诉和抗诉的期限为十日' },
      { k: '裁定', v: '不服裁定的上诉和抗诉的期限为五日' },
      { k: '起算', v: '均从接到判决书、裁定书的第二日起算' }
    ],
    clauseIndex: ['刑诉法 230'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-054', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '本人家属辩护人，被告人同意即可上', scenario: '上诉主体的范围',
    points: [
      { k: '当然主体', v: '被告人、自诉人及其法定代理人有权上诉，无需理由' },
      { k: '代为上诉', v: '被告人的辩护人、近亲属经被告人同意可以提出上诉' },
      { k: '附民当事人', v: '附带民事诉讼的当事人和其法定代理人，可就附民部分上诉' }
    ],
    clauseIndex: ['刑诉法 227'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-055', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '被害人五日请，检察五日答', scenario: '被害人请求抗诉的程序',
    points: [
      { k: '请求', v: '被害人及其法定代理人不服一审判决的，自收到判决书后五日以内，有权请求检察院提出抗诉' },
      { k: '答复', v: '检察院自收到请求后五日以内，应当作出是否抗诉的决定并答复请求人' },
      { k: '仅限判决', v: '对裁定不能请求抗诉' }
    ],
    clauseIndex: ['刑诉法 229'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-056', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '二审全案查，不受范围限', scenario: '二审的全面审查原则',
    points: [
      { k: '全案', v: '二审法院应当就一审判决认定的事实和适用法律进行全面审查，不受上诉或抗诉范围的限制' },
      { k: '共犯', v: '共同犯罪案件只有部分被告人上诉的，应当对全案进行审查，一并处理' }
    ],
    clauseIndex: ['刑诉法 233'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-057', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '只有被告人上诉，二审不得加刑', scenario: '上诉不加刑原则的适用',
    points: [
      { k: '不加刑', v: '被告人或其法定代理人、辩护人、近亲属上诉的案件，二审不得加重被告人刑罚' },
      { k: '例外', v: '检察院提出抗诉或者自诉人提出上诉的，不受该限制' },
      { k: '发回重审', v: '发回原审法院重新审判的案件，除有新的犯罪事实且检察机关补充起诉外，原审法院也不得加重刑罚' }
    ],
    clauseIndex: ['刑诉法 237'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-058', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '维持、改判、发回', scenario: '二审对一审判决的三种处理',
    points: [
      { k: '维持', v: '原判决认定事实和适用法律正确、量刑适当的，裁定驳回上诉或抗诉，维持原判' },
      { k: '改判', v: '适用法律有错误或量刑不当的，应当改判' },
      { k: '发回', v: '事实不清、证据不足的，可在查清事实后改判，也可撤销原判发回重审；违反法定程序的发回重审，发回重审仅限一次' }
    ],
    clauseIndex: ['刑诉法 236', '刑诉法 238'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-059', kind: 'mnemonic', subject: 'crim-proc', chapter: '审判·二审',
    mnemonic: '二审二三，加死刑再二', scenario: '二审案件审限',
    points: [
      { k: '基期', v: '应当在二个月以内审结' },
      { k: '一延', v: '可能判处死刑的案件或附带民事诉讼案件，以及法定四类情形的，经省级高级法院批准或决定，可延长二个月' },
      { k: '二延', v: '因特殊情况还需延长的，报请最高人民法院批准' }
    ],
    clauseIndex: ['刑诉法 243'],
    level: 'A'
  },
  /* ================= 死刑复核与执行 ================= */
  {
    id: 'mn-crimpro-060', kind: 'mnemonic', subject: 'crim-proc', chapter: '死刑复核与执行',
    mnemonic: '死刑最高核，死缓高级核', scenario: '死刑判决的核准权限',
    points: [
      { k: '死刑立即执行', v: '由最高人民法院核准' },
      { k: '死缓', v: '由高级人民法院核准' },
      { k: '分歧处理', v: '高级法院复核不同意判处死刑的，可以提审或者发回重新审判' }
    ],
    clauseIndex: ['刑诉法 246', '刑诉法 247'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-061', kind: 'mnemonic', subject: 'crim-proc', chapter: '死刑复核与执行',
    mnemonic: '错误、立功、怀孕，停止执行', scenario: '死刑停止执行的情形',
    points: [
      { k: '可能有错', v: '在执行前发现判决可能有错误的' },
      { k: '重大立功', v: '在执行前罪犯揭发重大犯罪事实或者有其他重大立功表现，可能需要改判的' },
      { k: '怀孕', v: '罪犯正在怀孕的' }
    ],
    clauseIndex: ['刑诉法 262'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-062', kind: 'mnemonic', subject: 'crim-proc', chapter: '死刑复核与执行',
    mnemonic: '过期、终审、死刑核，判决才生效', scenario: '发生法律效力的判决与裁定',
    points: [
      { k: '过期', v: '已过法定期限没有上诉、抗诉的判决和裁定' },
      { k: '终审', v: '终审的判决和裁定（二审）' },
      { k: '核准', v: '最高人民法院核准的死刑判决和高级人民法院核准的死缓判决' }
    ],
    clauseIndex: ['刑诉法 259'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-063', kind: 'mnemonic', subject: 'crim-proc', chapter: '死刑复核与执行',
    mnemonic: '病孕弱可监外，自残社会危不保外', scenario: '暂予监外执行的适用与禁止',
    points: [
      { k: '三情形', v: '有严重疾病需要保外就医的；怀孕或正在哺乳自己婴儿的妇女；生活不能自理、适用暂予监外执行不致危害社会的' },
      { k: '禁止', v: '对适用保外就医可能有社会危险性的罪犯，或者自伤自残的罪犯，不得保外就医' },
      { k: '批准权', v: '交付执行前，由交付执行的法院决定；在监狱服刑期间，由监狱提出意见报省级以上监狱管理机关批准' }
    ],
    clauseIndex: ['刑诉法 265', '刑诉法 267'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-064', kind: 'mnemonic', subject: 'crim-proc', chapter: '死刑复核与执行',
    mnemonic: '减刑假释，法院裁定', scenario: '减刑、假释的裁定程序',
    points: [
      { k: '建议', v: '由执行机关提出减刑、假释建议书' },
      { k: '裁定', v: '报请有管辖权的人民法院审核裁定，并将建议书副本抄送检察院' },
      { k: '监督', v: '检察院可以向法院提出书面意见' }
    ],
    clauseIndex: ['刑诉法 273'],
    level: 'B'
  },
  /* ================= 特别程序 ================= */
  {
    id: 'mn-crimpro-065', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·未成年人',
    mnemonic: '教育为主，惩罚为辅', scenario: '未成年人刑事案件的基本方针',
    points: [
      { k: '方针', v: '对犯罪的未成年人实行教育、感化、挽救的方针，坚持教育为主、惩罚为辅的原则' },
      { k: '保障', v: '保障未成年人行使其诉讼权利，保障其得到法律帮助' }
    ],
    clauseIndex: ['刑诉法 277'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-066', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·未成年人',
    mnemonic: '法定代理人到场，女的问女的', scenario: '讯问、审判未成年人的特殊保护',
    points: [
      { k: '到场', v: '讯问和审判未成年人时，应当通知其法定代理人到场；无法通知或不能到场的，可通知其他合适成年人到场' },
      { k: '在场', v: '讯问女性未成年犯罪嫌疑人，应当有女工作人员在场' },
      { k: '分别关押', v: '对被羁押的未成年人，应当与成年人分别关押、管理' }
    ],
    clauseIndex: ['刑诉法 281'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-067', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·未成年人',
    mnemonic: '未满十八判五下，犯罪记录要封存', scenario: '未成年人犯罪记录封存',
    points: [
      { k: '条件', v: '犯罪的时候不满十八周岁，被判处五年有期徒刑以下刑罚的' },
      { k: '效果', v: '对相关犯罪记录应当予以封存，不得向任何单位和个人提供' },
      { k: '例外', v: '司法机关为办案需要或者有关单位根据国家规定可以查询，但应对封存情况保密' }
    ],
    clauseIndex: ['刑诉法 286'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-068', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·未成年人',
    mnemonic: '四五六章，一年以下，悔罪附条件', scenario: '未成年人附条件不起诉的适用条件',
    points: [
      { k: '章节范围', v: '涉嫌刑法分则第四章、第五章、第六章规定的犯罪' },
      { k: '刑罚', v: '可能判处一年有期徒刑以下刑罚' },
      { k: '悔罪', v: '符合起诉条件，但有悔罪表现的' },
      { k: '考验期', v: '六个月以上一年以下，从检察院作出附条件不起诉的决定之日起计算' }
    ],
    clauseIndex: ['刑诉法 282', '刑诉法 283'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-069', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·当事人和解',
    mnemonic: '民间三下，过失七下', scenario: '当事人和解的公诉案件诉讼程序适用范围',
    points: [
      { k: '民间纠纷', v: '因民间纠纷引起，涉嫌刑法分则第四、五章规定的犯罪案件，可能判处三年有期徒刑以下刑罚的' },
      { k: '过失', v: '除渎职犯罪以外的可能判处七年有期徒刑以下刑罚的过失犯罪案件' },
      { k: '排除', v: '犯罪嫌疑人在五年以内曾经故意犯罪的，不适用和解程序' }
    ],
    clauseIndex: ['刑诉法 288'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-070', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·缺席审判',
    mnemonic: '贪恐在境外，缺席可审判', scenario: '犯罪嫌疑人、被告人缺席审判程序的适用',
    points: [
      { k: '罪名', v: '贪污贿赂犯罪，以及经最高人民检察院核准的严重危害国家安全犯罪、恐怖活动犯罪' },
      { k: '条件', v: '犯罪嫌疑人、被告人在境外，案件事实清楚，证据确实、充分，应当追究刑事责任' },
      { k: '辩护', v: '被告人有权委托辩护人，其近亲属可以代为委托' }
    ],
    clauseIndex: ['刑诉法 291', '刑诉法 293'],
    level: 'A'
  },
  {
    id: 'mn-crimpro-071', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·违法所得没收',
    mnemonic: '贪恐重大，逃一年或死亡', scenario: '违法所得没收程序的适用条件',
    points: [
      { k: '罪名', v: '贪污贿赂犯罪、恐怖活动犯罪等重大犯罪案件' },
      { k: '到不了案', v: '犯罪嫌疑人、被告人逃匿，在通缉一年后不能到案的' },
      { k: '死亡', v: '或者犯罪嫌疑人、被告人死亡的' },
      { k: '程序', v: '检察院向法院提出没收申请，法院受理后发出公告，公告期间为六个月' }
    ],
    clauseIndex: ['刑诉法 298', '刑诉法 299'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-072', kind: 'mnemonic', subject: 'crim-proc', chapter: '特别程序·强制医疗',
    mnemonic: '暴力加无责，还有继续危', scenario: '强制医疗程序的适用条件',
    points: [
      { k: '暴力', v: '实施暴力行为，危害公共安全或者严重危害公民人身安全' },
      { k: '无责', v: '经法定程序鉴定依法不负刑事责任的精神病人' },
      { k: '继续危', v: '有继续危害社会可能的，可以予以强制医疗' },
      { k: '决定权', v: '由人民法院决定；公安机关发现符合条件的应写出强制医疗意见书移送检察院，由检察院向法院提出申请' }
    ],
    clauseIndex: ['刑诉法 302', '刑诉法 303'],
    level: 'S'
  },
  /* ================= 认罪认罚与从宽 ================= */
  {
    id: 'mn-crimpro-073', kind: 'mnemonic', subject: 'crim-proc', chapter: '认罪认罚从宽',
    mnemonic: '认罪又认罚，依法可从宽', scenario: '认罪认罚从宽原则',
    points: [
      { k: '含义', v: '犯罪嫌疑人、被告人自愿如实供述自己的罪行，承认指控的犯罪事实，愿意接受处罚的，可以依法从宽处理' },
      { k: '贯穿全程', v: '该原则适用于刑事诉讼各阶段（侦查告知、审查起诉具结、审判确认）' }
    ],
    clauseIndex: ['刑诉法 15', '刑诉法 120'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-074', kind: 'mnemonic', subject: 'crim-proc', chapter: '认罪认罚从宽',
    mnemonic: '法院一般要采纳，五情形除外', scenario: '对量刑建议的裁判确认',
    points: [
      { k: '采纳', v: '被告人认罪认罚的，审判时法院依法作出判决时，一般应当采纳检察院指控的罪名和量刑建议' },
      { k: '例外', v: '被告人行为不构成犯罪或不应当追究、违背意愿认罪认罚、否认指控事实、起诉指控与审理认定不一致、其他可能影响公正审判的情形，量刑建议明显不当的除外' }
    ],
    clauseIndex: ['刑诉法 201'],
    level: 'S'
  },
  {
    id: 'mn-crimpro-075', kind: 'mnemonic', subject: 'crim-proc', chapter: '认罪认罚从宽',
    mnemonic: '速裁不认缓，上诉可真急', scenario: '速裁程序被告人的反悔权',
    points: [
      { k: '判决前', v: '被告人不服适用速裁程序作出的判决，可以在法定期限内提出上诉' },
      { k: '后果', v: '被告人违背意愿认罪认罚等情形导致原判事实认定错误的，二审依法改判或发回' }
    ],
    clauseIndex: ['刑诉法 224', '刑诉法 236'],
    level: 'B'
  },
  {
    id: 'mn-crimpro-076', kind: 'mnemonic', subject: 'crim-proc', chapter: '认罪认罚从宽',
    mnemonic: '监察先行拘留，检察十日决定', scenario: '监察机关移送案件的衔接处理',
    points: [
      { k: '先行拘留', v: '对于监察机关移送起诉的已采取留置措施的案件，检察院应当先行拘留，留置措施自动解除' },
      { k: '期限', v: '检察院应当在拘留后的十日以内作出是否逮捕、取保候审或者监视居住的决定；特殊情况下可延长一至四日' }
    ],
    clauseIndex: ['刑诉法 170'],
    level: 'A'
  }
];
