// Star Resonance Damage Calculator & Stat Optimizer Logic (v1.7)
document.addEventListener('DOMContentLoaded', () => {

    // === Season Constant Configurations ===
    const SEASON_CONSTANTS = {
        S1: { crit: 4457, fast: 4457, luck: 4457, dex: 4457, universal: 4457 },
        S2: { crit: 19967.36, fast: 19967.36, luck: 19967.36, dex: 19967.36, universal: 11200 },
        S3: { crit: 50000, fast: 50000, luck: 50000, dex: 50000, universal: 50000 }
    };

    // === Stat Baselines ===
    const BASELINES = {
        crit: 5.0,
        fast: 0.0,
        luck: 5.0,
        dex: 6.0,
        universal: 4.0
    };

    // === Class Metadata (Speed Conversion Rates) ===
    const CLASS_METADATA = {
        // ストームブレイド
        storm_blade_reijin: { mainStatName: '敏捷', classRate: 0.725, speedAtkRate: 1.6, speedCastRate: 1.0 },
        storm_blade_getsugei: { mainStatName: '敏捷', classRate: 0.725, speedAtkRate: 1.6, speedCastRate: 1.0 }, // +1.0%
        // ゲイルランサー
        gale_lancer_reppuu: { mainStatName: '敏捷', classRate: 0.725, speedAtkRate: 1.6, speedCastRate: 1.0 },
        gale_lancer_ranpuu: { mainStatName: '敏捷', classRate: 0.725, speedAtkRate: 1.6, speedCastRate: 1.0 }, // +1.0%
        // ディバインアーチャー
        divine_archer_ookami: { mainStatName: '敏捷', classRate: 0.58, speedAtkRate: 0.8, speedCastRate: 1.0 },
        divine_archer_taka: { mainStatName: '敏捷', classRate: 0.58, speedAtkRate: 0.8, speedCastRate: 1.0 }, // +0.2%
        // フロストメイジ
        frost_mage_hyouga: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.2, speedCastRate: 2.0 },
        frost_mage_souten: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.2, speedCastRate: 2.0 },
        // ヴァーダントオラクル
        verdant_oracle_shinyu: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.2, speedCastRate: 2.0 },
        verdant_oracle_isaki: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.2, speedCastRate: 2.0 },
        // ビートパフォーマー
        beat_performer_kyouon: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.6, speedCastRate: 2.0 },
        beat_performer_kyousou: { mainStatName: '知力', classRate: 0.60, speedAtkRate: 0.6, speedCastRate: 2.0 },
        // ヘヴィガーディアン
        heavy_guardian_goushu: { mainStatName: '筋力', classRate: { S1: 0.60, S2: 0.60, S3: 0.68 }, speedAtkRate: 0.6, speedCastRate: 1.0 },
        heavy_guardian_goushin: { mainStatName: '筋力', classRate: { S1: 0.60, S2: 0.60, S3: 0.68 }, speedAtkRate: 0.6, speedCastRate: 1.0 },
        // シールドファイター
        shield_fighter_koutate: { mainStatName: '筋力', classRate: { S1: 0.60, S2: 0.60, S3: 0.68 }, speedAtkRate: 0.6, speedCastRate: 1.0 },
        shield_fighter_kousai: { mainStatName: '筋力', classRate: { S1: 0.60, S2: 0.60, S3: 0.68 }, speedAtkRate: 0.6, speedCastRate: 1.0 }
    };

    // State object to hold values
    const state = {
        season: 'S2',
        classKey: 'storm_blade_reijin',
        inspiringVal: 0, // Default to OFF (0%)
        
        // Bidirectional values
        crit: { raw: 0, extra: 0, pct: 0 },
        fast: { raw: 0, extra: 0, pct: 0 },
        luck: { raw: 0, extra: 0, pct: 0 },
        universal: { raw: 0, extra: 0, pct: 0 },
        dex: { raw: 0, extra: 0, pct: 0 }
    };

    // === DOM Elements ===
    const seasonSelect = document.getElementById('season-select');
    const classSelect = document.getElementById('class-select');
    
    // Buff Settings Checkboxes
    const inspiring15 = document.getElementById('inspiring-1-5');
    const inspiring30 = document.getElementById('inspiring-3-0');
    const hpFluctuation = document.getElementById('hp-fluctuation');
    
    // Bidirectional Inputs & Custom Inline Inputs (Image 1 Column)
    const critRaw = document.getElementById('stat-crit-raw');
    const critPct = document.getElementById('stat-crit-pct');
    const manualCritDmg = document.getElementById('manual-crit-dmg');
    const applyCritAbi = document.getElementById('apply-crit-abi');
    const manualCritAbi = document.getElementById('manual-crit-abi');
    const baseAttackInterval = document.getElementById('base-attack-interval');

    const fastRaw = document.getElementById('stat-fast-raw');
    const fastPct = document.getElementById('stat-fast-pct');
    const convertedAtkSpeed = document.getElementById('converted-atk-speed');
    const gearAtkSpeed = document.getElementById('gear-atk-speed');
    const totalAtkSpeed = document.getElementById('total-atk-speed');
    const convertedCastSpeed = document.getElementById('converted-cast-speed');
    const gearCastSpeed = document.getElementById('gear-cast-speed');
    const totalCastSpeed = document.getElementById('total-cast-speed');

    const luckRaw = document.getElementById('stat-luck-raw');
    const luckPct = document.getElementById('stat-luck-pct');
    const manualLuckyDmg = document.getElementById('manual-lucky-dmg');
    const applyLuckyAbi = document.getElementById('apply-lucky-abi');
    const manualLuckyAbi = document.getElementById('manual-lucky-abi');
    const manualAbsoluteLuck = document.getElementById('manual-absolute-luck');
    const manualUltimateLuckCrit = document.getElementById('manual-ultimate-luck-crit');
    const manualFocusedLuck = document.getElementById('manual-focused-luck');

    const dexRaw = document.getElementById('stat-dex-raw');
    const dexPct = document.getElementById('stat-dex-pct');
    const dexBonusDisplay = document.getElementById('stat-dex-bonus-total');

    const universalRaw = document.getElementById('stat-universal-raw');
    const universalPct = document.getElementById('stat-universal-pct');
    const universalBonusDisplay = document.getElementById('stat-universal-bonus-pct');

    // Attack Power Card Inputs
    const statAttackPower = document.getElementById('stat-attack-power');
    const statRefineAtk = document.getElementById('stat-refine-atk');
    const statAtkAdd = document.getElementById('stat-atk-add');
    const statAtkPct = document.getElementById('stat-atk-pct');
    const statEliteDmg = document.getElementById('stat-elite-dmg');
    const statBossDmg = document.getElementById('stat-boss-dmg');
    const statAtkTotalDisplay = document.getElementById('stat-atk-total-display');

    // Output Indicators & Checkboxes
    const applyAtkSpeed = document.getElementById('apply-atk-speed');
    const applyCastSpeed = document.getElementById('apply-cast-speed');

    const outNormal = document.getElementById('out-normal');
    const outCrit = document.getElementById('out-crit');
    const outLucky = document.getElementById('out-lucky');
    const outLuckyCrit = document.getElementById('out-lucky-crit');
    const out1000Dps = document.getElementById('out-1000-dps');

    // Action Triggers & Optimizer
    const btnReset = document.getElementById('btn-reset');
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const importFile = document.getElementById('import-file');
    const efficiencyPanel = document.getElementById('efficiency-panel');
    const breakEvenPanel = document.getElementById('break-even-panel');
    
    // Optimizer DOM
    const optCurrentTotal = document.getElementById('optimizer-current-total');
    const optBudget = document.getElementById('optimizer-budget');
    const btnOptimize = document.getElementById('btn-optimize');
    const btnApplyOptimal = document.getElementById('btn-apply-optimal');
    const optResultContainer = document.getElementById('optimizer-result');
    const optDiffPct = document.getElementById('opt-diff-pct');
    const optRecommendedStats = document.getElementById('opt-recommended-stats');
    const optResultTotal = document.getElementById('opt-result-total');

    // === Event Binding & Class Mapping Logic ===

    function init() {
        updateStateFromInputs();
        syncClassUI();
        syncAllBidirectionals();
        calculateDamage();
    }

    function updateStateFromInputs() {
        state.season = seasonSelect.value || 'S2';
        state.classKey = classSelect.value;
        
        if (inspiring15.checked) {
            state.inspiringVal = 1.5;
        } else if (inspiring30.checked) {
            state.inspiringVal = 3.0;
        } else {
            state.inspiringVal = 0;
        }
    }

    function getConstants() {
        return SEASON_CONSTANTS[state.season];
    }

    function getClassMetadata() {
        return CLASS_METADATA[state.classKey];
    }

    function getClassAtkRate() {
        const meta = getClassMetadata();
        if (typeof meta.classRate === 'object') {
            return meta.classRate[state.season] || meta.classRate.S1;
        }
        return meta.classRate;
    }

    statAttackPower.addEventListener('input', calculateDamage);
    manualCritDmg.addEventListener('input', calculateDamage);
    manualCritDmg.addEventListener('change', () => {
        let val = parseFloat(manualCritDmg.value) || 0;
        if (val < 50) {
            manualCritDmg.value = "50.00";
            calculateDamage();
        }
    });
    manualLuckyDmg.addEventListener('input', calculateDamage);
    
    if (baseAttackInterval) baseAttackInterval.addEventListener('input', calculateDamage);

    // Sync input status based on class characteristics
    function syncClassUI() {
        const meta = getClassMetadata();
        const labelAtk = document.getElementById('label-atk-speed-conversion');
        const labelCast = document.getElementById('label-cast-speed-conversion');
        if (labelAtk) {
            labelAtk.textContent = `攻撃速度 (×${meta.speedAtkRate})`;
        }
        if (labelCast) {
            labelCast.textContent = `詠唱速度 (×${meta.speedCastRate})`;
        }

        // Show/hide Lucky Damage abi checkbox/wrapper only for Oracle Isaki (verdant_oracle_isaki)
        const luckyAbiContainer = document.getElementById('lucky-abi-container');
        if (luckyAbiContainer) {
            if (state.classKey === 'verdant_oracle_isaki') {
                luckyAbiContainer.style.display = 'flex';
            } else {
                luckyAbiContainer.style.display = 'none';
                if (applyLuckyAbi) {
                    applyLuckyAbi.checked = false; // Turn off if hidden
                }
            }
        }
    }

    classSelect.addEventListener('change', () => {
        updateStateFromInputs();
        syncClassUI();
        calculateDamage();
    });

    // Checkbox mutual exclusions for Inspiring
    inspiring15.addEventListener('change', () => {
        if (inspiring15.checked) {
            inspiring30.checked = false;
        }
        updateStateFromInputs();
        syncAllBidirectionals();
        calculateDamage();
    });

    inspiring30.addEventListener('change', () => {
        if (inspiring30.checked) {
            inspiring15.checked = false;
        }
        updateStateFromInputs();
        syncAllBidirectionals();
        calculateDamage();
    });

    hpFluctuation.addEventListener('change', () => {
        syncAllBidirectionals();
        calculateDamage();
    });

    // Speed checkbox exclusive checks
    applyAtkSpeed.addEventListener('change', () => {
        if (applyAtkSpeed.checked) {
            applyCastSpeed.checked = false;
        }
        calculateDamage();
    });

    applyCastSpeed.addEventListener('change', () => {
        if (applyCastSpeed.checked) {
            applyAtkSpeed.checked = false;
        }
        calculateDamage();
    });

    // === Bidirectional Conversion Logic ===

    function rawToPct(raw, constant) {
        if (isNaN(raw) || raw <= 0) return 0;
        return (raw / (raw + constant)) * 100;
    }

    // Bidirectional pct to raw
    function pctToRaw(pct, constant) {
        if (isNaN(pct) || pct <= 0) return 0;
        if (pct >= 100) return 999999;
        return (constant * (pct / 100)) / (1 - (pct / 100));
    }

    function getBasePctFor(stat, rawVal) {
        const constants = getConstants();
        const constant = constants[stat];
        const baseline = BASELINES[stat];
        const inspiringVal = state.inspiringVal;
        
        const totalRaw = rawVal + (state[stat].extra || 0);
        return rawToPct(totalRaw, constant) + baseline + inspiringVal;
    }

    function calculateLuckyDmgMultiplier(luckPct, isAbiActive, abiMult, absoluteLuck, ultimateLuckCrit, focusedLuck) {
        const abiTerm = isAbiActive ? (5 + luckPct * abiMult) : 0;
        return (40 + abiTerm + (luckPct * 0.25) + absoluteLuck + ultimateLuckCrit + focusedLuck) * 1.5;
    }

    function updateLuckyDmgDisplay() {
        const luckPctVal = state.luck.pct || 0;
        const isAbiActive = applyLuckyAbi ? applyLuckyAbi.checked : true;
        const customAbiMult = manualLuckyAbi ? parseFloat(manualLuckyAbi.value) || 1.2 : 1.2;
        const absoluteLuck = manualAbsoluteLuck ? parseFloat(manualAbsoluteLuck.value) || 0 : 0;
        const ultimateLuckCrit = manualUltimateLuckCrit ? parseFloat(manualUltimateLuckCrit.value) || 0 : 0;
        const focusedLuck = manualFocusedLuck ? parseFloat(manualFocusedLuck.value) || 0 : 0;

        const luckyDmgMultiplier = calculateLuckyDmgMultiplier(luckPctVal, isAbiActive, customAbiMult, absoluteLuck, ultimateLuckCrit, focusedLuck);
        if (manualLuckyDmg) {
            manualLuckyDmg.value = luckyDmgMultiplier.toFixed(2);
        }
    }

    function getCritFormulaBonus(critPct, isAbiActive) {
        const manualCritAbiEl = document.getElementById('manual-crit-abi');
        const customAbiMult = manualCritAbiEl ? parseFloat(manualCritAbiEl.value) || 1.2 : 1.2;
        const abiMult = isAbiActive ? customAbiMult : 0;
        const abilityBaseUp = critPct * abiMult;
        const multiFactor = 1 + (critPct / 100);
        return (abilityBaseUp + 2.6) * multiFactor;
    }

    let appInitialized = false;

    function syncAllBidirectionals(changedStat, changedSource) {
        const oldLuckPct = state.luck.pct || 0;
        const oldCritPct = state.crit.pct || 0;
        const constants = getConstants();
        const inspiringVal = state.inspiringVal;
        const hpFluctuationActive = hpFluctuation.checked;

        // If a specific input changed, update its raw state first
        if (changedStat && changedSource) {
            const rawInput = document.getElementById(`stat-${changedStat}-raw`);
            const pctInput = document.getElementById(`stat-${changedStat}-pct`);
            const constant = constants[changedStat];
            const baseline = BASELINES[changedStat];

            if (changedSource === 'raw') {
                const val = parseFloat(rawInput.value) || 0;
                state[changedStat].raw = val;
            } else if (changedSource === 'extra') {
                // state is already updated via event listener
            } else {
                const val = parseFloat(pctInput.value) || 0;
                
                // Determine other base percentages to see if this edited stat has the 10.0% boost
                const otherStats = ['crit', 'fast', 'luck', 'dex', 'universal'].filter(s => s !== changedStat);
                const otherBasePcts = otherStats.map(s => getBasePctFor(s, state[s].raw));
                const maxOthers = Math.max(...otherBasePcts);

                let basePct = val;
                if (hpFluctuationActive) {
                    if (val - 10.0 >= maxOthers) {
                        basePct = val - 10.0;
                    }
                }
                const rawPct = basePct - baseline - inspiringVal;
                let requiredTotalRaw = rawPct > 0 ? pctToRaw(rawPct, constant) : 0;
                let requiredBaseRaw = requiredTotalRaw - (state[changedStat].extra || 0);
                if (requiredBaseRaw < 0) requiredBaseRaw = 0;
                
                state[changedStat].raw = requiredBaseRaw;
                
                if (document.activeElement !== rawInput) {
                    rawInput.value = state[changedStat].raw ? Math.round(state[changedStat].raw) : '0';
                }
            }
        }

        // Calculate base percentages for all stats
        const basePcts = {
            crit: getBasePctFor('crit', state.crit.raw),
            fast: getBasePctFor('fast', state.fast.raw),
            luck: getBasePctFor('luck', state.luck.raw),
            dex: getBasePctFor('dex', state.dex.raw),
            universal: getBasePctFor('universal', state.universal.raw)
        };

        const maxBasePct = Math.max(basePcts.crit, basePcts.fast, basePcts.luck, basePcts.dex, basePcts.universal);

        // Update the final state percentages and update DOM inputs
        ['crit', 'fast', 'luck', 'dex', 'universal'].forEach(stat => {
            const isHighest = (basePcts[stat] === maxBasePct);
            const addHPBonus = (hpFluctuationActive && isHighest) ? 10.0 : 0.0;
            state[stat].pct = basePcts[stat] + addHPBonus;

            const pctInput = document.getElementById(`stat-${stat}-pct`);
            const rawInput = document.getElementById(`stat-${stat}-raw`);
            const rowEl = document.querySelector(`.stat-row[data-stat="${stat}"]`);

            if (document.activeElement !== pctInput) {
                pctInput.value = state[stat].pct.toFixed(2);
            }
            if (document.activeElement !== rawInput) {
                rawInput.value = state[stat].raw ? Math.round(state[stat].raw) : '0';
            }

            if (rowEl) {
                if (hpFluctuationActive && isHighest) {
                    rowEl.classList.add('hp-boosted');
                } else {
                    rowEl.classList.remove('hp-boosted');
                }
            }
        });

        const universalBonusDisplay = document.getElementById('stat-universal-bonus-pct');
        if (universalBonusDisplay) {
            const bonus = state.universal.pct * 0.35;
            universalBonusDisplay.textContent = bonus.toFixed(2) + '%';
        }

        // Adjust Lucky Damage based on Luck % diff
        if (appInitialized) {
            updateLuckyDmgDisplay();
            
            const newCritPct = state.crit.pct;
            if (Math.abs(newCritPct - oldCritPct) > 0.0001) {
                const isAbiActive = applyCritAbi ? applyCritAbi.checked : false;
                if (isAbiActive) {
                    const oldBonus = getCritFormulaBonus(oldCritPct, true);
                    const newBonus = getCritFormulaBonus(newCritPct, true);
                    const diff = newBonus - oldBonus;
                    
                    const currentCritDmg = parseFloat(manualCritDmg.value) || 0;
                    let nextCritDmg = currentCritDmg + diff;
                    if (nextCritDmg < 50) nextCritDmg = 50;
                    manualCritDmg.value = nextCritDmg.toFixed(2);
                }
            }
        }
    }

    // Bidirectional inputs listener hooking
    ['crit', 'fast', 'luck', 'universal', 'dex'].forEach(stat => {
        const rawEl = document.getElementById(`stat-${stat}-raw`);
        const pctEl = document.getElementById(`stat-${stat}-pct`);
        const extraEl = document.getElementById(`stat-${stat}-extra`);

        rawEl.addEventListener('input', () => {
            syncAllBidirectionals(stat, 'raw');
            calculateDamage();
        });
        pctEl.addEventListener('input', () => {
            syncAllBidirectionals(stat, 'pct');
            calculateDamage();
        });
        if (extraEl) {
            extraEl.addEventListener('input', () => {
                state[stat].extra = parseFloat(extraEl.value) || 0;
                syncAllBidirectionals(stat, 'extra');
                calculateDamage();
            });
        }
    });



    seasonSelect.addEventListener('change', () => {
        updateStateFromInputs();
        syncAllBidirectionals();
        calculateDamage();
    });

    // === Damage Simulator Helper (Non-DOM parsing for performance & threshold searching) ===
    function getExpectedScoreAt(statKey, extraRaw) {
        const constants = getConstants();
        const meta = getClassMetadata();
        const inspiringVal = state.inspiringVal;
        const hpFluctuationActive = hpFluctuation.checked;

        // 1. Attack calculation
        let atk = parseFloat(statAttackPower.value) || 0;
        if (statKey === 'atk') {
            atk += extraRaw;
        }

        const refineAtkVal = parseFloat(statRefineAtk.value) || 0;
        const atkAddVal = parseFloat(statAtkAdd.value) || 0;
        const atkPctVal = parseFloat(statAtkPct.value) || 0;
        const totalBaseAtk = Math.round(atk * (1 + atkPctVal / 100) + atkAddVal);
        const combinedAtk = totalBaseAtk + refineAtkVal;
        const atkFactor = combinedAtk / 3510;
        const baseScore = 10000 * atkFactor;

        // 2. Adjusting base percentages based on extra raw
        const basePcts = {
            crit: getBasePctFor('crit', state.crit.raw + (statKey === 'crit' ? extraRaw : 0)),
            fast: getBasePctFor('fast', state.fast.raw + (statKey === 'fast' ? extraRaw : 0)),
            luck: getBasePctFor('luck', state.luck.raw + (statKey === 'luck' ? extraRaw : 0)),
            universal: getBasePctFor('universal', state.universal.raw + (statKey === 'universal' ? extraRaw : 0)),
            dex: getBasePctFor('dex', state.dex.raw + (statKey === 'dex' ? extraRaw : 0))
        };

        const maxBasePct = Math.max(basePcts.crit, basePcts.fast, basePcts.luck, basePcts.dex, basePcts.universal);

        // Apply HP Fluctuation if active
        let critPct = basePcts.crit + (hpFluctuationActive && basePcts.crit === maxBasePct ? 10.0 : 0.0);
        let fastPct = basePcts.fast + (hpFluctuationActive && basePcts.fast === maxBasePct ? 10.0 : 0.0);
        let luckPct = basePcts.luck + (hpFluctuationActive && basePcts.luck === maxBasePct ? 10.0 : 0.0);
        let universalPct = basePcts.universal + (hpFluctuationActive && basePcts.universal === maxBasePct ? 10.0 : 0.0);
        let dexPct = basePcts.dex + (hpFluctuationActive && basePcts.dex === maxBasePct ? 10.0 : 0.0);

        // 3. Multipliers
        const universalMult = 1 + (universalPct / 100) * 0.35;
        const dexRateVal = 0.7;
        const dexBonusVal = dexPct * dexRateVal;
        const dexMult = 1 + (dexBonusVal / 100);

        const eliteDmgVal = parseFloat(statEliteDmg.value) || 0;
        const bossDmgVal = parseFloat(statBossDmg.value) || 0;
        const specMult = 1 + (eliteDmgVal + bossDmgVal) / 100;

        const normalHitScore = Math.floor(baseScore * universalMult * dexMult * specMult);
        const isCritAbiActive = applyCritAbi ? applyCritAbi.checked : true;
        const currentCritBonus = getCritFormulaBonus(state.crit.pct, isCritAbiActive);
        const simulatedCritBonus = getCritFormulaBonus(critPct, isCritAbiActive);
        const critDiff = simulatedCritBonus - currentCritBonus;

        const currentCritDmg = parseFloat(manualCritDmg.value) || 0;
        const critDmgMultiplier = currentCritDmg + critDiff;
        const critMultiplier = 1 + (critDmgMultiplier / 100);
        const critHitScore = Math.floor(normalHitScore * critMultiplier);

        const isAbiActive = applyLuckyAbi ? applyLuckyAbi.checked : true;
        const customAbiMult = manualLuckyAbi ? parseFloat(manualLuckyAbi.value) || 1.2 : 1.2;
        const absoluteLuck = manualAbsoluteLuck ? parseFloat(manualAbsoluteLuck.value) || 0 : 0;
        const ultimateLuckCrit = manualUltimateLuckCrit ? parseFloat(manualUltimateLuckCrit.value) || 0 : 0;
        const focusedLuck = manualFocusedLuck ? parseFloat(manualFocusedLuck.value) || 0 : 0;
        const luckyDmgMultiplier = calculateLuckyDmgMultiplier(luckPct, isAbiActive, customAbiMult, absoluteLuck, ultimateLuckCrit, focusedLuck);

        const luckyHitScore = Math.floor(normalHitScore * (luckyDmgMultiplier / 100));
        const luckyCritHitScore = Math.floor(luckyHitScore * critMultiplier);

        const cRate = Math.min(1.0, critPct / 100);
        const lRate = Math.min(1.0, luckPct / 100);

        const baseExpected = normalHitScore * (1 - cRate) + critHitScore * cRate;
        const luckyExpected = luckyHitScore * (1 - cRate) + luckyCritHitScore * cRate;
        const expectedSingleHit = baseExpected + (lRate * luckyExpected);

        // 4. Speed Factor
        let activeSpeedPct = 0;
        const totalAtkSpeedVal = (fastPct * meta.speedAtkRate) + (parseFloat(gearAtkSpeed.value) || 0);
        const totalCastSpeedVal = (fastPct * meta.speedCastRate) + (parseFloat(gearCastSpeed.value) || 0);

        if (applyAtkSpeed.checked) {
            activeSpeedPct = totalAtkSpeedVal;
        } else if (applyCastSpeed.checked) {
            activeSpeedPct = totalCastSpeedVal;
        }

        const baseInterval = parseFloat(document.getElementById('base-attack-interval').value) || 1.0;
        const attacksPerSecond = (1 / baseInterval) * (1 + (activeSpeedPct / 100));

        return expectedSingleHit * 1000 * attacksPerSecond;
    }

    // === Calculations Engine ===

    function calculateDamage() {
        const meta = getClassMetadata();

        updateLuckyDmgDisplay();

        // 1. Parsing Attack values
        const atk = parseFloat(statAttackPower.value) || 0;

        const refineAtkVal = parseFloat(statRefineAtk.value) || 0;
        const atkAddVal = parseFloat(statAtkAdd.value) || 0;
        const atkPctVal = parseFloat(statAtkPct.value) || 0;

        // 2. Base score scaling coefficient
        const totalBaseAtk = Math.round(atk * (1 + atkPctVal / 100) + atkAddVal);
        if (statAtkTotalDisplay) {
            statAtkTotalDisplay.textContent = totalBaseAtk.toLocaleString();
        }

        const combinedAtk = totalBaseAtk + refineAtkVal;
        const atkFactor = combinedAtk / 3510;
        const baseScore = 10000 * atkFactor;

        // 3. Multipliers
        const universalMult = 1 + (state.universal.pct / 100) * 0.35;
        const dexRateVal = 0.7;
        const dexBonusVal = state.dex.pct * dexRateVal;
        const dexMult = 1 + (dexBonusVal / 100);

        if (dexBonusDisplay) {
            dexBonusDisplay.textContent = dexBonusVal.toFixed(2) + '%';
        }

        const eliteDmgVal = parseFloat(statEliteDmg.value) || 0;
        const bossDmgVal = parseFloat(statBossDmg.value) || 0;
        const specMult = 1 + (eliteDmgVal + bossDmgVal) / 100;

        const normalHitScore = Math.floor(baseScore * universalMult * dexMult * specMult);

        // Crit Calculations
        let addCritDmgVal = parseFloat(manualCritDmg.value) || 50;
        if (addCritDmgVal < 50) {
            addCritDmgVal = 50;
        }
        const critMultiplier = 1 + (addCritDmgVal / 100);
        const critHitScore = Math.floor(normalHitScore * critMultiplier);

        // Lucky Hit Calculations
        const luckyDmgMultiplier = parseFloat(manualLuckyDmg.value) || 0;
        const luckyHitScore = Math.floor(normalHitScore * (luckyDmgMultiplier / 100));
        const luckyCritHitScore = Math.floor(luckyHitScore * critMultiplier);

        // Display Score Components
        outNormal.textContent = Math.round(normalHitScore).toLocaleString();
        outCrit.textContent = Math.round(critHitScore).toLocaleString();
        outLucky.textContent = Math.round(luckyDmgMultiplier > 0 ? luckyHitScore : 0).toLocaleString();
        outLuckyCrit.textContent = Math.round(luckyDmgMultiplier > 0 ? luckyCritHitScore : 0).toLocaleString();

        // Expected score calculation
        const cRate = Math.min(1.0, state.crit.pct / 100);
        const lRate = Math.min(1.0, state.luck.pct / 100);

        const baseExpected = normalHitScore * (1 - cRate) + critHitScore * cRate;
        const luckyExpected = luckyHitScore * (1 - cRate) + luckyCritHitScore * cRate;
        const expectedSingleHit = baseExpected + (lRate * luckyExpected);

        // 4. Converted Speeds Display & Manual Gear calculation
        const rawFastPct = state.fast.pct;
        const rawAtkSpeedConverted = rawFastPct * meta.speedAtkRate;
        const rawCastSpeedConverted = rawFastPct * meta.speedCastRate;

        convertedAtkSpeed.textContent = rawAtkSpeedConverted.toFixed(1) + '%';
        convertedCastSpeed.textContent = rawCastSpeedConverted.toFixed(1) + '%';

        const gearAtkSpeedVal = parseFloat(gearAtkSpeed.value) || 0;
        const gearCastSpeedVal = parseFloat(gearCastSpeed.value) || 0;

        const totalAtkSpeedVal = rawAtkSpeedConverted + gearAtkSpeedVal;
        const totalCastSpeedVal = rawCastSpeedConverted + gearCastSpeedVal;

        totalAtkSpeed.textContent = totalAtkSpeedVal.toFixed(1) + '%';
        totalCastSpeed.textContent = totalCastSpeedVal.toFixed(1) + '%';

        // 5. Speed Factor check
        let activeSpeedPct = 0;
        if (applyAtkSpeed.checked) {
            activeSpeedPct = totalAtkSpeedVal;
        } else if (applyCastSpeed.checked) {
            activeSpeedPct = totalCastSpeedVal;
        }

        const baseInterval = parseFloat(document.getElementById('base-attack-interval').value) || 1.0;
        const attacksPerSecond = (1 / baseInterval) * (1 + (activeSpeedPct / 100));

        // Final Scores
        const score1000Pure = expectedSingleHit * 1000;
        const score1000SpeedAdjusted = expectedSingleHit * 1000 * attacksPerSecond;

        out1000Dps.textContent = Math.round(score1000SpeedAdjusted).toLocaleString();

        // 6. Optimization Analysis
        calculateEfficiency(score1000SpeedAdjusted);
        
        // Update Optimizer UI tracking
        if (typeof syncOptimizerCurrentTotal === 'function') {
            syncOptimizerCurrentTotal();
        }
    }

    const recalculateInputs = [
        statAttackPower, statRefineAtk,
        statAtkAdd, statAtkPct,
        statEliteDmg, statBossDmg,
        manualCritDmg, manualLuckyDmg,
        gearAtkSpeed, gearCastSpeed, applyAtkSpeed, applyCastSpeed,
        manualLuckyAbi, manualAbsoluteLuck, manualUltimateLuckCrit, manualFocusedLuck
    ];

    recalculateInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateDamage);
        }
    });

    if (applyLuckyAbi) {
        applyLuckyAbi.addEventListener('change', calculateDamage);
    }

    if (applyCritAbi) {
        applyCritAbi.addEventListener('change', () => {
            if (!applyCritAbi.checked) {
                manualCritDmg.value = "50.00";
            }
            calculateDamage();
        });
    }

    // Toggle checkboxes for analysis stats
    ['crit', 'fast', 'universal', 'dex', 'luck'].forEach(stat => {
        const toggleEl = document.getElementById(`toggle-analysis-${stat}`);
        if (toggleEl) {
            toggleEl.addEventListener('change', calculateDamage);
        }
    });

    // === Stat Efficiency Analysis ===

    function calculateEfficiency(currentScore) {
        if (currentScore <= 0) {
            efficiencyPanel.innerHTML = '<div class="no-data" style="color: var(--text-muted); font-size:12px; padding:10px; text-align:center;">攻撃力を入力すると効率が表示されます</div>';
            breakEvenPanel.innerHTML = '';
            return;
        }

        const candidates = [
            { name: '会心', key: 'crit', toggleId: 'toggle-analysis-crit' },
            { name: 'ファスト', key: 'fast', toggleId: 'toggle-analysis-fast' },
            { name: '万能', key: 'universal', toggleId: 'toggle-analysis-universal' },
            { name: '器用さ', key: 'dex', toggleId: 'toggle-analysis-dex' },
            { name: '幸運', key: 'luck', toggleId: 'toggle-analysis-luck' }
        ];

        // Filter based on checkbox status
        const activeCandidates = candidates.filter(c => {
            const el = document.getElementById(c.toggleId);
            return el ? el.checked : true;
        });

        if (activeCandidates.length === 0) {
            efficiencyPanel.innerHTML = '<div class="no-data" style="color: var(--text-muted); font-size:12px; padding:10px; text-align:center;">分析対象ステータスを選択してください</div>';
            breakEvenPanel.innerHTML = '';
            return;
        }

        // 1. Evaluate baseline growths
        const results = activeCandidates.map(candidate => {
            const simulatedScore = getExpectedScoreAt(candidate.key, 100);
            const growthPct = ((simulatedScore - currentScore) / currentScore) * 100;
            return {
                name: candidate.name,
                key: candidate.key,
                growth: growthPct
            };
        });

        results.sort((a, b) => b.growth - a.growth);
        const maxGrowth = Math.max(...results.map(r => r.growth), 0.001);

        // 2. Render charts
        efficiencyPanel.innerHTML = '';
        results.forEach(res => {
            const pctWidth = Math.min(100, (res.growth / maxGrowth) * 100);
            const effItem = document.createElement('div');
            effItem.className = 'efficiency-item';
            effItem.innerHTML = `
                <div class="eff-header">
                    <span class="eff-name">${res.name} (+100)</span>
                    <span class="eff-pct">+${res.growth.toFixed(3)}%</span>
                </div>
                <div class="eff-bar-wrapper">
                    <div class="eff-bar" style="width: ${pctWidth}%;"></div>
                </div>
            `;
            efficiencyPanel.appendChild(effItem);
        });

        // 3. Optimal Threshold Search (Break-Even Point)
        const best = results[0];
        const runnerUp = results[1];

        if (results.length === 1) {
            breakEvenPanel.innerHTML = `
                <div class="tips-box break-even-tip">
                    <strong>最適配分アドバイス:</strong><br>
                    現在、分析対象ステータスとして <strong>${best.name}</strong> のみが選択されています。複数のステータスを選択すると、優先度の比較や閾値分析が行えます。
                </div>
            `;
        } else if (best && runnerUp && best.growth > runnerUp.growth + 0.001) {
            let extraRaw = 0;
            const step = 50;
            const limit = 5000;
            const runnerUpGrowth = runnerUp.growth;

            while (extraRaw < limit) {
                extraRaw += step;
                // Compute future marginal growth from extraRaw point
                const scoreAtX = getExpectedScoreAt(best.key, extraRaw);
                const scoreAtXPlus100 = getExpectedScoreAt(best.key, extraRaw + 100);
                const growthAtX = ((scoreAtXPlus100 - scoreAtX) / scoreAtX) * 100;

                if (growthAtX <= runnerUpGrowth) {
                    break;
                }
            }

            if (extraRaw >= limit) {
                breakEvenPanel.innerHTML = `
                    <div class="tips-box break-even-tip">
                        <strong>最適配分アドバイス:</strong><br>
                        最優先ステータスである <strong>${best.name}</strong> の効率が非常に高いです。さらに <strong>＋${limit.toLocaleString()} 以上</strong> 振っても最優先順位は変わりません。
                    </div>
                `;
            } else {
                breakEvenPanel.innerHTML = `
                    <div class="tips-box break-even-tip">
                        <strong>最適配分アドバイス:</strong><br>
                        まずは <strong>${best.name}</strong> を優先して伸ばしましょう。追加で <strong>＋${extraRaw}</strong> 振った時点で、次点の <strong>${runnerUp.name}</strong> と効率が並びます。そこから配分を分散するのが最適です。
                    </div>
                `;
            }
        } else {
            breakEvenPanel.innerHTML = `
                <div class="tips-box break-even-tip">
                    <strong>最適配分アドバイス:</strong><br>
                    現在、上位ステータスの伸び率がほぼ拮抗しています。特定のステータスに偏らせず、バランスよく配分するのが最適です。
                </div>
            `;
        }
    }

    // === Reset & Export / Import Options ===

    btnReset.addEventListener('click', () => {
        inspiring15.checked = false; // Default to OFF
        inspiring30.checked = false; // Default to OFF
        hpFluctuation.checked = false;
        
        critRaw.value = 0;
        manualCritDmg.value = 50;
        fastRaw.value = 0;
        gearAtkSpeed.value = 0;
        gearCastSpeed.value = 0;
        luckRaw.value = 0;
        manualLuckyDmg.value = 0;
        universalRaw.value = 0;
        dexRaw.value = 0;

        if (manualAbsoluteLuck) manualAbsoluteLuck.value = 0;
        if (manualUltimateLuckCrit) manualUltimateLuckCrit.value = 0;
        if (manualFocusedLuck) manualFocusedLuck.value = 0;
        if (manualLuckyAbi) manualLuckyAbi.value = 1.2;

        state.crit.raw = 0;
        state.fast.raw = 0;
        state.luck.raw = 0;
        state.universal.raw = 0;
        state.dex.raw = 0;
        
        state.crit.extra = 0;
        state.fast.extra = 0;
        state.luck.extra = 0;
        state.universal.extra = 0;
        state.dex.extra = 0;
        
        const extraInputs = ['crit', 'fast', 'luck', 'universal', 'dex'];
        extraInputs.forEach(stat => {
            const el = document.getElementById(`stat-${stat}-extra`);
            if (el) el.value = 0;
        });

// Preserve attack power values on reset (do not reset)
// statRefineAtk.value = 0; // Preserve on reset
// statAtkAdd.value = 0; // Preserve on reset
// statAtkPct.value = 0; // Preserve on reset
// statEliteDmg.value = 0; // Preserve on reset
// statBossDmg.value = 0; // Preserve on reset

        applyAtkSpeed.checked = false;
        applyCastSpeed.checked = false;

        init();
    });

    btnExport.addEventListener('click', () => {
        const config = {};
        document.querySelectorAll('input, select').forEach(el => {
            if (el.id && el.type !== 'file') {
                if (el.type === 'checkbox') {
                    config[el.id] = el.checked;
                } else {
                    config[el.id] = el.value;
                }
            }
        });

        const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `star_resonance_score_build_${state.season}_${state.classKey}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    btnImport.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                Object.keys(config).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) {
                        if (el.type === 'checkbox') {
                            el.checked = config[key];
                        } else {
                            el.value = config[key];
                        }
                        el.dispatchEvent(new Event('change'));
                    }
                });
                
                updateStateFromInputs();
                syncAllBidirectionals();
                calculateDamage();
            } catch (err) {
                alert('ビルドファイルの読み込みに失敗しました。');
            }
        };
        reader.readAsText(file);
    });

    // === Optimizer Logic ===
    let lastCalculatedOptimalState = null;

    function syncOptimizerCurrentTotal() {
        const total = state.crit.raw + state.fast.raw + state.luck.raw + state.dex.raw + state.universal.raw;
        const totalInt = Math.round(total);
        if (optCurrentTotal) optCurrentTotal.value = totalInt;
        
        if (optBudget) {
            optBudget.value = totalInt;
        }
    }

    function evaluateScoreForAllocation(alloc) {
        // Fast simulation logic replicating getExpectedScoreAt logic
        const meta = getClassMetadata();
        const hpFluctuationActive = hpFluctuation.checked;
        const dexRateVal = 0.7;
        const addCritDmgVal = parseFloat(manualCritDmg.value) || 50;
        const addLuckyDmgVal = parseFloat(manualLuckyDmg.value) || 41.25;

        // Base percentages
        const basePcts = {
            crit: getBasePctFor('crit', alloc.crit),
            fast: getBasePctFor('fast', alloc.fast),
            luck: getBasePctFor('luck', alloc.luck),
            universal: getBasePctFor('universal', alloc.universal),
            dex: getBasePctFor('dex', alloc.dex)
        };

        const maxBasePct = Math.max(basePcts.crit, basePcts.fast, basePcts.luck, basePcts.dex, basePcts.universal);

        let cPct = basePcts.crit + (hpFluctuationActive && basePcts.crit === maxBasePct ? 10.0 : 0.0);
        let fPct = basePcts.fast + (hpFluctuationActive && basePcts.fast === maxBasePct ? 10.0 : 0.0);
        let lPct = basePcts.luck + (hpFluctuationActive && basePcts.luck === maxBasePct ? 10.0 : 0.0);
        let uPct = basePcts.universal + (hpFluctuationActive && basePcts.universal === maxBasePct ? 10.0 : 0.0);
        let dPct = basePcts.dex + (hpFluctuationActive && basePcts.dex === maxBasePct ? 10.0 : 0.0);

        const uniMult = 1 + (uPct / 100) * 0.35;
        const dexBonusVal = dPct * dexRateVal;
        const dexMult = 1 + (dexBonusVal / 100);

        const cRate = Math.min(1.0, cPct / 100);
        const lRate = Math.min(1.0, lPct / 100);
        
        const isCritAbiActive = applyCritAbi ? applyCritAbi.checked : true;
        const currentCritBonus = getCritFormulaBonus(state.crit.pct, isCritAbiActive);
        const simulatedCritBonus = getCritFormulaBonus(cPct, isCritAbiActive);
        const critDiff = simulatedCritBonus - currentCritBonus;

        const currentCritDmg = parseFloat(manualCritDmg.value) || 0;
        let critDmgMultiplier = currentCritDmg + critDiff;
        if (critDmgMultiplier < 50) {
            critDmgMultiplier = 50;
        }
        const cDmg = 1 + (critDmgMultiplier / 100);
        
        const isAbiActive = applyLuckyAbi ? applyLuckyAbi.checked : true;
        const customAbiMult = manualLuckyAbi ? parseFloat(manualLuckyAbi.value) || 1.2 : 1.2;
        const absoluteLuck = manualAbsoluteLuck ? parseFloat(manualAbsoluteLuck.value) || 0 : 0;
        const ultimateLuckCrit = manualUltimateLuckCrit ? parseFloat(manualUltimateLuckCrit.value) || 0 : 0;
        const focusedLuck = manualFocusedLuck ? parseFloat(manualFocusedLuck.value) || 0 : 0;
        const luckyDmgMultiplier = calculateLuckyDmgMultiplier(lPct, isAbiActive, customAbiMult, absoluteLuck, ultimateLuckCrit, focusedLuck);
        const lDmg = 1 + (luckyDmgMultiplier / 100);

        const expectedHitMult = 
            (1 - cRate) * (1 - lRate) * 1.0 +
            cRate * (1 - lRate) * cDmg +
            (1 - cRate) * lRate * lDmg +
            cRate * lRate * cDmg * lDmg;

        let activeSpeedPct = 0;
        const totalAtkSpeedVal = (fPct * meta.speedAtkRate) + (parseFloat(document.getElementById('gear-atk-speed').value) || 0);
        const totalCastSpeedVal = (fPct * meta.speedCastRate) + (parseFloat(document.getElementById('gear-cast-speed').value) || 0);

        if (applyAtkSpeed.checked) {
            activeSpeedPct = totalAtkSpeedVal;
        } else if (applyCastSpeed.checked) {
            activeSpeedPct = totalCastSpeedVal;
        }

        const baseInterval = parseFloat(document.getElementById('base-attack-interval').value) || 1.0;
        const attacksPerSecond = (1 / baseInterval) * (1 + (activeSpeedPct / 100));

        return uniMult * dexMult * expectedHitMult * attacksPerSecond;
    }

    function runOptimizer() {
        let budget = parseFloat(optBudget.value) || 0;
        if (budget < 0) budget = 0;

        // Read active targets
        const targets = {
            crit: document.getElementById('opt-target-crit').checked,
            fast: document.getElementById('opt-target-fast').checked,
            universal: document.getElementById('opt-target-universal').checked,
            dex: document.getElementById('opt-target-dex').checked,
            luck: document.getElementById('opt-target-luck').checked
        };

        // Initialize allocation. Unchecked stats are fixed at their current values.
        let alloc = { crit: 0, fast: 0, luck: 0, dex: 0, universal: 0 };
        let fixedTotal = 0;

        if (!targets.crit) { alloc.crit = state.crit.raw; fixedTotal += alloc.crit; }
        if (!targets.fast) { alloc.fast = state.fast.raw; fixedTotal += alloc.fast; }
        if (!targets.universal) { alloc.universal = state.universal.raw; fixedTotal += alloc.universal; }
        if (!targets.dex) { alloc.dex = state.dex.raw; fixedTotal += alloc.dex; }
        if (!targets.luck) { alloc.luck = state.luck.raw; fixedTotal += alloc.luck; }

        const stats = ['crit', 'fast', 'luck', 'dex', 'universal'];
        const activeStats = stats.filter(s => targets[s]);

        let remaining = Math.round(budget) - Math.round(fixedTotal);
        if (remaining < 0) remaining = 0;
        
        while (remaining > 0 && activeStats.length > 0) {
            let step = 1;
            if (remaining >= 100) step = 10;
            else step = 1;
            
            let bestStat = null;
            let bestScore = -1;
            
            for (let s of activeStats) {
                let temp = { ...alloc };
                temp[s] += step;
                let score = evaluateScoreForAllocation(temp);
                if (score > bestScore) {
                    bestScore = score;
                    bestStat = s;
                }
            }
            alloc[bestStat] += step;
            remaining -= step;
        }

        // Truncate to integers as requested by user
        ['crit', 'fast', 'luck', 'dex', 'universal'].forEach(s => {
            if (alloc[s]) alloc[s] = Math.floor(alloc[s]);
        });

        lastCalculatedOptimalState = alloc;

        const currentAlloc = {
            crit: state.crit.raw,
            fast: state.fast.raw,
            luck: state.luck.raw,
            dex: state.dex.raw,
            universal: state.universal.raw
        };
        const currentMultiplier = evaluateScoreForAllocation(currentAlloc);
        const optimalMultiplier = evaluateScoreForAllocation(alloc);

        let diffPct = 0;
        if (currentMultiplier > 0) {
            diffPct = ((optimalMultiplier / currentMultiplier) - 1) * 100;
        }

        let diffColor = 'var(--accent-green)';
        let diffText = `+${diffPct.toFixed(2)}% DPS`;
        if (diffPct < 0) { 
            diffColor = 'var(--accent-red)';
            diffText = `${diffPct.toFixed(2)}% DPS`;
        } else if (diffPct === 0) {
            diffColor = 'var(--text-muted)';
            diffText = `最適化済 (+0.00%)`;
        }

        if (optResultContainer) optResultContainer.style.display = 'block';
        if (optDiffPct) {
            optDiffPct.textContent = diffText;
            optDiffPct.style.color = diffColor;
        }
        if (optResultTotal) {
            optResultTotal.textContent = budget.toString();
        }
        if (optRecommendedStats) {
            optRecommendedStats.innerHTML = `
                <div><span style="color:var(--text-muted);">会心:</span> <strong style="color:var(--accent-gold);">${Math.floor(alloc.crit)}</strong></div>
                <div><span style="color:var(--text-muted);">ﾌｧｽﾄ:</span> <strong style="color:var(--accent-blue);">${Math.floor(alloc.fast)}</strong></div>
                <div><span style="color:var(--text-muted);">幸運:</span> <strong style="color:var(--accent-green);">${Math.floor(alloc.luck)}</strong></div>
                <div><span style="color:var(--text-muted);">器用:</span> <strong style="color:var(--accent-cyan);">${Math.floor(alloc.dex)}</strong></div>
                <div><span style="color:var(--text-muted);">万能:</span> <strong style="color:var(--accent-purple);">${Math.floor(alloc.universal)}</strong></div>
            `;
        }

        if (btnApplyOptimal) btnApplyOptimal.style.display = 'block';
    }

    if (btnOptimize) btnOptimize.addEventListener('click', runOptimizer);

    if (btnApplyOptimal) {
        btnApplyOptimal.addEventListener('click', () => {
            if (lastCalculatedOptimalState) {
                critRaw.value = lastCalculatedOptimalState.crit;
                fastRaw.value = lastCalculatedOptimalState.fast;
                luckRaw.value = lastCalculatedOptimalState.luck;
                dexRaw.value = lastCalculatedOptimalState.dex;
                universalRaw.value = lastCalculatedOptimalState.universal;
                
                initialBudgetSet = true; // prevent auto override
                
                // Set state directly
                state.crit.raw = lastCalculatedOptimalState.crit;
                state.fast.raw = lastCalculatedOptimalState.fast;
                state.luck.raw = lastCalculatedOptimalState.luck;
                state.dex.raw = lastCalculatedOptimalState.dex;
                state.universal.raw = lastCalculatedOptimalState.universal;
                
                init();
            }
        });
    }

    // Remove obsolete budget event listener

    // Initialize all values (default open state)
    critRaw.value = 1000;
    fastRaw.value = 1000;
    luckRaw.value = 1000;
    manualLuckyDmg.value = 40;
    dexRaw.value = 1000;
    universalRaw.value = 1000;
    if (manualAbsoluteLuck) manualAbsoluteLuck.value = 0;
    if (manualUltimateLuckCrit) manualUltimateLuckCrit.value = 0;
    if (manualFocusedLuck) manualFocusedLuck.value = 0;
    statAttackPower.value = 3000; // Default to 3000
    statRefineAtk.value = 800; // Default to 800
    statAtkAdd.value = 0;
    statAtkPct.value = 0;
    statEliteDmg.value = 0;
    statBossDmg.value = 0;
    
    syncClassUI();
    init();
    appInitialized = true;
});
