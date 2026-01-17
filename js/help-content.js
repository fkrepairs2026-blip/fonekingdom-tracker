/**
 * BILINGUAL HELP CONTENT FOR FONEKINGDOM TRACKER
 * English and Tagalog instructions for all user workflows
 */

const helpContent = {
    // Language strings for UI elements
    ui: {
        helpTitle: {
            en: "Help Guide",
            tl: "Gabay sa Paggamit"
        },
        howTo: {
            en: "How to",
            tl: "Paano"
        },
        clickToExpand: {
            en: "Click to expand",
            tl: "I-click para buksan"
        },
        tip: {
            en: "Tip",
            tl: "Paalala"
        },
        important: {
            en: "Important",
            tl: "Mahalaga"
        },
        steps: {
            en: "Steps",
            tl: "Mga Hakbang"
        },
        searchHelp: {
            en: "Search help topics...",
            tl: "Maghanap ng tulong..."
        }
    },

    // Device Receiving/Intake
    deviceIntake: {
        title: {
            en: "Receive New Device",
            tl: "Tumanggap ng Bagong Device"
        },
        summary: {
            en: "How to properly receive and record a customer's device for repair",
            tl: "Paano tamang tumanggap at isulat ang detalye ng device ng customer"
        },
        steps: {
            en: [
                "Select <strong>Customer Type</strong>: Walk-in (individual) or Dealer (business)",
                "Enter <strong>Customer Name</strong> and <strong>Contact Number</strong> (must start with 09)",
                "Select device <strong>Brand</strong> and <strong>Model</strong> from dropdowns",
                "Choose <strong>Problem Type</strong> (Hardware/Software category)",
                "Describe the <strong>Problem</strong> in detail (what's broken or not working)",
                "Optional: Add IMEI/Serial, Passcode, Color, Storage, Photo",
                "If price is agreed: Fill <strong>Estimated Cost</strong> and pre-approval pricing section",
                "For technicians: Choose if you'll accept the repair yourself or send to pool",
                "Click <strong>Submit</strong> - Device will appear in Received Devices tab"
            ],
            tl: [
                "Piliin ang <strong>Uri ng Customer</strong>: Walk-in (tao) o Dealer (negosyo)",
                "Ilagay ang <strong>Pangalan ng Customer</strong> at <strong>Contact Number</strong> (dapat magsimula sa 09)",
                "Pumili ng <strong>Brand</strong> at <strong>Model</strong> ng device mula sa listahan",
                "Piliin ang <strong>Uri ng Problema</strong> (Hardware o Software)",
                "Ilarawan ng detalyado ang <strong>Problema</strong> (ano ang sira o hindi gumagana)",
                "Opsyonal: Idagdag ang IMEI/Serial, Passcode, Kulay, Storage, Larawan",
                "Kung napag-usapan na ang presyo: Ilagay ang <strong>Estimated Cost</strong> at pricing details",
                "Para sa technician: Piliin kung tatanggapin mo mismo o ipapadala sa pool",
                "I-click ang <strong>Submit</strong> - Lalabas ang device sa Received Devices tab"
            ]
        },
        tips: {
            en: [
                "Always verify contact number with customer before saving",
                "Take clear photos of device condition for documentation",
                "For software repairs: Check the FRP Lock warning carefully",
                "Estimated Cost prevents advance payment from exceeding the estimate",
                "Back Job checkbox is for returning devices with same issue (warranty)"
            ],
            tl: [
                "Laging i-verify ang contact number sa customer bago i-save",
                "Kumuha ng malinaw na larawan ng device para sa dokumentasyon",
                "Para sa software repair: Basahin ang babala tungkol sa FRP Lock",
                "Ang Estimated Cost ay hadlang sa advance payment na higit sa tinantya",
                "Ang Back Job checkbox ay para sa bumabalik na device na may parehong sira (warranty)"
            ]
        }
    },

    // Pre-Approval Pricing
    preApprovalPricing: {
        title: {
            en: "Pre-Approval Pricing",
            tl: "Presyo na Napagkasunduan"
        },
        summary: {
            en: "When customer has already agreed to repair cost before receiving device",
            tl: "Kapag pumayag na ang customer sa presyo bago ibigay ang device"
        },
        steps: {
            en: [
                "Check the <strong>Pre-Approval Pricing</strong> section in the receive form",
                "Select <strong>Supplier</strong> where parts will be sourced",
                "Choose <strong>Repair Type</strong> (Screen, Battery, Charging Port, etc.)",
                "Enter <strong>Parts Cost</strong> - cost of replacement parts",
                "Enter <strong>Labor Cost</strong> - service/labor fee",
                "System auto-calculates <strong>Total Cost</strong>",
                "Device will be marked as 'Approved' immediately",
                "Technician can accept and start repair right away"
            ],
            tl: [
                "Markahan ang seksyon ng <strong>Pre-Approval Pricing</strong> sa form",
                "Piliin ang <strong>Supplier</strong> kung saan kukunin ang parts",
                "Pumili ng <strong>Uri ng Repair</strong> (Screen, Battery, Charging Port, atbp.)",
                "Ilagay ang <strong>Parts Cost</strong> - presyo ng replacement parts",
                "Ilagay ang <strong>Labor Cost</strong> - bayad sa serbisyo",
                "Awtomatikong kinakalkula ng sistema ang <strong>Kabuuang Presyo</strong>",
                "Magiging 'Approved' agad ang device",
                "Pwede nang tanggapin at simulan ng technician ang repair"
            ]
        },
        tips: {
            en: [
                "Pre-approval speeds up the process - no waiting for customer approval",
                "Make sure customer understands the final cost before accepting device",
                "You can still collect advance payment when receiving the device"
            ],
            tl: [
                "Mas mabilis ang proseso ng pre-approval - walang paghihintay sa customer",
                "Siguraduhing naintindihan ng customer ang final na presyo",
                "Pwede pa ring maningil ng advance payment habang tumatanggap ng device"
            ]
        }
    },

    // Technician Accepting Repair
    acceptRepair: {
        title: {
            en: "Accept Repair Job",
            tl: "Tanggapin ang Repair Job"
        },
        summary: {
            en: "How technicians accept repairs and complete pre-repair checklist",
            tl: "Paano tatanggapin ng technician ang repair at punan ang checklist"
        },
        steps: {
            en: [
                "Go to <strong>Received Devices</strong> or <strong>My Jobs</strong> tab",
                "Click <strong>Accept</strong> button on a repair job",
                "Complete the <strong>Pre-Repair Checklist</strong>:",
                "&nbsp;&nbsp;• Physical Condition: Grade device appearance (Excellent/Good/Fair/Poor/Damaged)",
                "&nbsp;&nbsp;• Screen Condition: Any cracks or damage?",
                "&nbsp;&nbsp;• Battery Health: Check if original/aftermarket and condition",
                "&nbsp;&nbsp;• Buttons Working: Test all physical buttons",
                "&nbsp;&nbsp;• Check for Water Damage",
                "&nbsp;&nbsp;• Missing Parts/Accessories",
                "Add any additional notes about device condition",
                "Click <strong>Accept Repair</strong> - Status changes to 'In Progress'",
                "Device now appears in your <strong>My Jobs</strong> tab"
            ],
            tl: [
                "Pumunta sa <strong>Received Devices</strong> o <strong>My Jobs</strong> tab",
                "I-click ang <strong>Accept</strong> button sa repair job",
                "Kumpletuhin ang <strong>Pre-Repair Checklist</strong>:",
                "&nbsp;&nbsp;• Physical Condition: Markahan ang hitsura (Excellent/Good/Fair/Poor/Damaged)",
                "&nbsp;&nbsp;• Screen Condition: May sira o bitak ba?",
                "&nbsp;&nbsp;• Battery Health: Tignan kung original/aftermarket at kondisyon",
                "&nbsp;&nbsp;• Buttons Working: Subukan lahat ng physical buttons",
                "&nbsp;&nbsp;• Tignan kung may Water Damage",
                "&nbsp;&nbsp;• Kulang na Parts/Accessories",
                "Idagdag ang ibang detalye tungkol sa kondisyon ng device",
                "I-click ang <strong>Accept Repair</strong> - Magiging 'In Progress' ang status",
                "Lalabas na ang device sa iyong <strong>My Jobs</strong> tab"
            ]
        },
        tips: {
            en: [
                "Pre-repair checklist protects you - documents device condition before you start",
                "Take photos if there's pre-existing damage to avoid disputes later",
                "You can only accept repairs if pricing is already approved",
                "Once accepted, the repair appears in your personal 'My Jobs' list"
            ],
            tl: [
                "Ang pre-repair checklist ay proteksyon mo - naka-document ang kondisyon bago magsimula",
                "Kumuha ng larawan kung may dating sira para iwas-gulo mamaya",
                "Pwede lang tanggapin kung naka-approve na ang presyo",
                "Kapag tinanggap na, lalabas sa iyong personal na 'My Jobs' list"
            ]
        }
    },

    // Status Updates
    statusUpdates: {
        title: {
            en: "Update Repair Status",
            tl: "I-update ang Status ng Repair"
        },
        summary: {
            en: "How to change device status as repair progresses",
            tl: "Paano baguhin ang status ng device habang umuusad ang repair"
        },
        steps: {
            en: [
                "Find the device in any tab (My Jobs, In Progress, etc.)",
                "Click <strong>Update Status</strong> button",
                "Select the appropriate new status:",
                "&nbsp;&nbsp;• <strong>In Progress</strong> - Currently working on repair",
                "&nbsp;&nbsp;• <strong>Waiting for Parts</strong> - Need to order/get parts",
                "&nbsp;&nbsp;• <strong>Ready for Pickup</strong> - Repair complete, notify customer",
                "&nbsp;&nbsp;• <strong>RTO (Return to Owner)</strong> - Cannot repair or customer declined",
                "Add notes explaining the status change (optional but recommended)",
                "Click <strong>Update</strong> - Status changes immediately",
                "Device automatically moves to the correct tab"
            ],
            tl: [
                "Hanapin ang device sa kahit anong tab (My Jobs, In Progress, atbp.)",
                "I-click ang <strong>Update Status</strong> button",
                "Pumili ng bagong status:",
                "&nbsp;&nbsp;• <strong>In Progress</strong> - Ginagawa na ang repair",
                "&nbsp;&nbsp;• <strong>Waiting for Parts</strong> - Kailangan ng parts",
                "&nbsp;&nbsp;• <strong>Ready for Pickup</strong> - Tapos na, sabihan ang customer",
                "&nbsp;&nbsp;• <strong>RTO (Return to Owner)</strong> - Hindi ma-repair o ayaw ng customer",
                "Idagdag ang dahilan ng pagbabago ng status (opsyonal pero inirerekomenda)",
                "I-click ang <strong>Update</strong> - Magbabago agad ang status",
                "Awtomatikong lilipat ang device sa tamang tab"
            ]
        },
        tips: {
            en: [
                "Always update status so customers and staff know the current situation",
                "'Ready for Pickup' status automatically notifies customer (if system enabled)",
                "Use 'Waiting for Parts' when you need to order - prevents customer from expecting completion",
                "RTO requires reason selection and may include diagnosis fee"
            ],
            tl: [
                "Laging i-update ang status para alam ng customer at staff ang sitwasyon",
                "'Ready for Pickup' ay awtomatikong nagpapaalaam sa customer (kung naka-enable)",
                "Gamitin ang 'Waiting for Parts' kung kailangan umorder - para makapaghintay ang customer",
                "Ang RTO ay nangangailangan ng dahilan at pwedeng may diagnosis fee"
            ]
        }
    },

    // RTO Process
    rtoProcess: {
        title: {
            en: "Return to Owner (RTO)",
            tl: "Ibalik sa May-ari (RTO)"
        },
        summary: {
            en: "When device cannot be repaired or customer declines the service",
            tl: "Kapag hindi ma-repair ang device o ayaw ng customer"
        },
        steps: {
            en: [
                "Click <strong>Update Status</strong> and select <strong>RTO</strong>",
                "Choose <strong>RTO Reason</strong>:",
                "&nbsp;&nbsp;• Unable to Repair - Technical limitation",
                "&nbsp;&nbsp;• Parts Not Available - Cannot source replacement parts",
                "&nbsp;&nbsp;• Customer Declined Cost - Price too high for customer",
                "&nbsp;&nbsp;• Not Economical to Repair - Cost exceeds device value",
                "&nbsp;&nbsp;• Customer Changed Mind - No longer wants repair",
                "&nbsp;&nbsp;• Other - Specify reason in notes",
                "Add detailed notes explaining the situation",
                "If applicable: Enter <strong>Diagnosis Fee</strong> (for checking/testing)",
                "Click <strong>Set as RTO</strong> - Device moves to RTO Devices tab",
                "Customer must still pay any diagnosis fee and collect their device"
            ],
            tl: [
                "I-click ang <strong>Update Status</strong> at piliin ang <strong>RTO</strong>",
                "Pumili ng <strong>Dahilan ng RTO</strong>:",
                "&nbsp;&nbsp;• Unable to Repair - Hindi kaya ayusin dahil sa teknikal na dahilan",
                "&nbsp;&nbsp;• Parts Not Available - Walang makuhang replacement parts",
                "&nbsp;&nbsp;• Customer Declined Cost - Mahal para sa customer",
                "&nbsp;&nbsp;• Not Economical to Repair - Mas mahal pa sa halaga ng device",
                "&nbsp;&nbsp;• Customer Changed Mind - Ayaw na ng customer",
                "&nbsp;&nbsp;• Other - Isulat ang dahilan sa notes",
                "Magdagdag ng detalyadong paliwanag",
                "Kung meron: Ilagay ang <strong>Diagnosis Fee</strong> (bayad sa pag-check/test)",
                "I-click ang <strong>Set as RTO</strong> - Lilipat sa RTO Devices tab",
                "Kailangan pa ring bayaran ng customer ang diagnosis fee at kunin ang device"
            ]
        },
        tips: {
            en: [
                "Always explain RTO reason clearly to avoid customer complaints",
                "Diagnosis fee covers your time spent checking the device",
                "RTO devices should be returned to customer as soon as possible",
                "Document any parts already purchased - customer may need to pay for them"
            ],
            tl: [
                "Laging ipaliwanag ng malinaw ang dahilan ng RTO para walang reklamo",
                "Ang diagnosis fee ay bayad sa oras na ginugol sa pag-check",
                "Dapat ibalik agad sa customer ang RTO devices",
                "I-document ang mga parts na nabili na - baka kailangan bayaran ng customer"
            ]
        }
    },

    // Recording Payments
    recordPayment: {
        title: {
            en: "Record Payment",
            tl: "Isulat ang Bayad"
        },
        summary: {
            en: "How to properly record customer payments for repairs",
            tl: "Paano tamang isulat ang bayad ng customer"
        },
        steps: {
            en: [
                "Find the repair and click <strong>Record Payment</strong> button",
                "Select <strong>Payment Date</strong> (today by default)",
                "Enter <strong>Payment Amount</strong> - how much customer is paying",
                "Choose <strong>Payment Method</strong>:",
                "&nbsp;&nbsp;• Cash - Physical money",
                "&nbsp;&nbsp;• GCash - Mobile wallet (requires 13-digit reference number)",
                "&nbsp;&nbsp;• Bank Transfer - Online banking",
                "&nbsp;&nbsp;• Check - Bank check",
                "&nbsp;&nbsp;• Credit Card - Card payment",
                "If GCash: Enter the <strong>13-digit Reference Number</strong>",
                "Add <strong>Payment Notes</strong> if needed (optional)",
                "Upload <strong>Payment Proof</strong> photo if available (recommended)",
                "Click <strong>Save Payment</strong> - Balance is updated automatically"
            ],
            tl: [
                "Hanapin ang repair at i-click ang <strong>Record Payment</strong> button",
                "Piliin ang <strong>Petsa ng Bayad</strong> (default ay ngayon)",
                "Ilagay ang <strong>Halaga ng Bayad</strong> - magkano binayad ng customer",
                "Pumili ng <strong>Paraan ng Bayad</strong>:",
                "&nbsp;&nbsp;• Cash - Pisikal na pera",
                "&nbsp;&nbsp;• GCash - Mobile wallet (kailangan ng 13-digit reference number)",
                "&nbsp;&nbsp;• Bank Transfer - Online banking",
                "&nbsp;&nbsp;• Check - Bank check",
                "&nbsp;&nbsp;• Credit Card - Card payment",
                "Kung GCash: Ilagay ang <strong>13-digit Reference Number</strong>",
                "Magdagdag ng <strong>Payment Notes</strong> kung kailangan (opsyonal)",
                "I-upload ang larawan ng <strong>Proof ng Payment</strong> kung meron (inirerekomenda)",
                "I-click ang <strong>Save Payment</strong> - Awtomatikong babaguhin ang balance"
            ]
        },
        tips: {
            en: [
                "You can record partial payments - customer doesn't need to pay in full",
                "For technicians: Cash payments require daily remittance submission",
                "Admin/Manager payments are auto-verified; others need verification",
                "Always ask for GCash reference number for tracking and disputes",
                "Cannot backdate payments on locked dates (system prevents fraud)"
            ],
            tl: [
                "Pwedeng partial payment - hindi kailangang kumpleto agad",
                "Para sa technician: Cash payments ay kailangan i-remit araw-araw",
                "Admin/Manager payments ay auto-verified; iba ay kailangan ng verification",
                "Laging hingin ang GCash reference number para sa tracking at disputes",
                "Hindi pwedeng i-backdate ang payments sa locked dates (iwas-fraud)"
            ]
        }
    },

    // Device Release
    deviceRelease: {
        title: {
            en: "Release Device to Customer",
            tl: "I-release ang Device sa Customer"
        },
        summary: {
            en: "How to properly release repaired devices to customers",
            tl: "Paano tamang i-release ang natapos na device sa customer"
        },
        steps: {
            en: [
                "Go to <strong>For Release</strong> tab (devices with 'Ready for Pickup' status)",
                "Find the device and click <strong>Release Device</strong> button",
                "Choose <strong>Verification Method</strong>:",
                "&nbsp;&nbsp;• <strong>With Service Slip</strong> - Customer has the service slip",
                "&nbsp;&nbsp;• <strong>Without Service Slip</strong> - Lost slip, needs extra verification",
                "Confirm <strong>Customer Name</strong> matches exactly",
                "Confirm <strong>Contact Number</strong> matches exactly",
                "If WITHOUT slip: Enter customer's <strong>Address</strong> (required for audit)",
                "Optional: Upload photo of claimant or service slip",
                "If customer paying during release: Check 'Customer Paid During Release'",
                "&nbsp;&nbsp;• Enter payment amount, method, and reference (if applicable)",
                "Click <strong>Release Device</strong> - Status changes to 'Released'",
                "Device auto-finalizes to 'Claimed' at 6:00 PM Manila time"
            ],
            tl: [
                "Pumunta sa <strong>For Release</strong> tab (mga 'Ready for Pickup' na device)",
                "Hanapin ang device at i-click ang <strong>Release Device</strong> button",
                "Pumili ng <strong>Paraan ng Verification</strong>:",
                "&nbsp;&nbsp;• <strong>With Service Slip</strong> - May service slip ang customer",
                "&nbsp;&nbsp;• <strong>Without Service Slip</strong> - Nawala ang slip, kailangan ng extra verification",
                "Kumpirmahin na tama ang <strong>Pangalan ng Customer</strong>",
                "Kumpirmahin na tama ang <strong>Contact Number</strong>",
                "Kung WALANG slip: Ilagay ang <strong>Address</strong> ng customer (kailangan para sa audit)",
                "Opsyonal: I-upload ang larawan ng kumuha o ng service slip",
                "Kung babayad habang kinukuha: Markahan ang 'Customer Paid During Release'",
                "&nbsp;&nbsp;• Ilagay ang halaga, paraan ng bayad, at reference (kung applicable)",
                "I-click ang <strong>Release Device</strong> - Magiging 'Released' ang status",
                "Awtomatikong magiging 'Claimed' ang device sa 6:00 PM Manila time"
            ]
        },
        tips: {
            en: [
                "Always verify customer identity before releasing - check ID if unsure",
                "Service slip is proof of ownership - require it whenever possible",
                "Without slip requires address for security audit trail",
                "Collect full payment before releasing if possible",
                "Released status has grace period until 6pm - can undo if needed",
                "After 6pm, device auto-finalizes to 'Claimed' (cannot undo)"
            ],
            tl: [
                "Laging i-verify ang customer bago i-release - tignan ang ID kung hindi sigurado",
                "Ang service slip ay patunay ng ownership - hingin kung meron",
                "Kapag walang slip, kailangan ng address para sa security audit",
                "Kolektahin ang buong bayad bago i-release kung pwede",
                "Ang Released status ay may grace period hanggang 6pm - pwedeng i-undo",
                "Pagkatapos ng 6pm, magiging 'Claimed' na (hindi na pwedeng i-undo)"
            ]
        }
    },

    // Technician Remittance
    techRemittance: {
        title: {
            en: "Daily Remittance (Technicians)",
            tl: "Araw-arawang Remittance (Technician)"
        },
        summary: {
            en: "How technicians submit daily cash collections and expenses",
            tl: "Paano magsumite ng cash collections at gastos ng technician"
        },
        steps: {
            en: [
                "Throughout the day: Record all cash payments you collect",
                "Record all expenses: Click <strong>Record Expense</strong> button",
                "&nbsp;&nbsp;• Categories: Delivery, Cash Advance, Transportation, Meals, Parts, Other",
                "&nbsp;&nbsp;• Enter amount and description",
                "Go to <strong>Daily Remittance</strong> tab to review:",
                "&nbsp;&nbsp;• Total Cash Collected - All cash payments you received",
                "&nbsp;&nbsp;• Total Expenses - All costs you incurred",
                "&nbsp;&nbsp;• Your Commission - 40% of gross collections (auto-calculated)",
                "&nbsp;&nbsp;• Expected Remittance - (Collections - Expenses - Commission)",
                "Click <strong>Submit Remittance</strong> button",
                "Select <strong>Recipient</strong> - Who you're giving cash to (Admin/Manager/Cashier)",
                "If commission calculation is wrong: Check 'Manual Override' and correct it",
                "Enter <strong>Actual Amount Remitting</strong> - Cash you're handing over",
                "If amount differs from expected:",
                "&nbsp;&nbsp;• Minor (<5%): Yellow warning, optional explanation",
                "&nbsp;&nbsp;• Major (≥5%): Red alert, MUST explain discrepancy",
                "Add any additional notes",
                "Click <strong>Submit</strong> - Wait for Admin/Manager/Cashier to verify"
            ],
            tl: [
                "Buong araw: Isulat lahat ng cash payments na nakolekta mo",
                "Isulat lahat ng gastos: I-click ang <strong>Record Expense</strong> button",
                "&nbsp;&nbsp;• Kategorya: Delivery, Cash Advance, Transportation, Meals, Parts, Other",
                "&nbsp;&nbsp;• Ilagay ang halaga at deskripsyon",
                "Pumunta sa <strong>Daily Remittance</strong> tab para tignan:",
                "&nbsp;&nbsp;• Total Cash Collected - Lahat ng cash na natanggap mo",
                "&nbsp;&nbsp;• Total Expenses - Lahat ng ginastos mo",
                "&nbsp;&nbsp;• Your Commission - 40% ng gross collections (auto-calculated)",
                "&nbsp;&nbsp;• Expected Remittance - (Collections - Expenses - Commission)",
                "I-click ang <strong>Submit Remittance</strong> button",
                "Piliin ang <strong>Recipient</strong> - Kanino mo ibibigay ang cash (Admin/Manager/Cashier)",
                "Kung mali ang commission: Markahan ang 'Manual Override' at itama",
                "Ilagay ang <strong>Actual Amount Remitting</strong> - Cash na ibibigay mo",
                "Kung iba ang halaga sa expected:",
                "&nbsp;&nbsp;• Maliit (<5%): Yellow warning, opsyonal ang paliwanag",
                "&nbsp;&nbsp;• Malaki (≥5%): Red alert, KAILANGAN mag-explain",
                "Magdagdag ng notes kung may iba pang sasabihin",
                "I-click ang <strong>Submit</strong> - Hintayin ang verification ng Admin/Manager/Cashier"
            ]
        },
        tips: {
            en: [
                "Submit remittance DAILY - don't accumulate multiple days",
                "Always count cash twice before submitting",
                "Keep receipts for all expenses - may be requested for verification",
                "If rejected, review discrepancy and resubmit with correct amount",
                "Commission is 40% of GROSS (before expenses), not net",
                "Parts cost should be recorded separately in repair details"
            ],
            tl: [
                "Mag-submit ARAW-ARAW - huwag pagsama-samahin ang maraming araw",
                "Laging bilangin ng dalawang beses ang cash bago mag-submit",
                "Ingatan ang receipts ng expenses - baka hilingin sa verification",
                "Kung rejected, suriin ang pagkakaiba at i-resubmit ng tama",
                "Ang commission ay 40% ng GROSS (bago expenses), hindi net",
                "Ang parts cost ay dapat isulat separately sa repair details"
            ]
        }
    },

    // Verify Remittance (Cashier/Admin)
    verifyRemittance: {
        title: {
            en: "Verify Technician Remittance",
            tl: "I-verify ang Remittance ng Technician"
        },
        summary: {
            en: "How to review and approve technician daily remittances",
            tl: "Paano suriin at aprubahan ang remittance ng technician"
        },
        steps: {
            en: [
                "Go to <strong>Verify Remittance</strong> tab",
                "Review pending remittance submissions",
                "Check the following details:",
                "&nbsp;&nbsp;• Total Cash Collected - Does it match records?",
                "&nbsp;&nbsp;• Total Expenses - Are expenses reasonable and documented?",
                "&nbsp;&nbsp;• Commission Calculation - Is 40% correct?",
                "&nbsp;&nbsp;• Expected vs Actual Amount - Any discrepancy?",
                "&nbsp;&nbsp;• Technician's Explanation - If there's a difference",
                "Click <strong>View Details</strong> to see individual payments and expenses",
                "Count the actual cash handed over by technician",
                "If everything is correct: Click <strong>Approve Remittance</strong>",
                "&nbsp;&nbsp;• All payments marked as 'Verified'",
                "&nbsp;&nbsp;• Remittance status changes to 'Verified'",
                "If there's a problem: Click <strong>Reject Remittance</strong>",
                "&nbsp;&nbsp;• Payments reset to 'Pending'",
                "&nbsp;&nbsp;• Technician must resubmit with corrections"
            ],
            tl: [
                "Pumunta sa <strong>Verify Remittance</strong> tab",
                "Suriin ang pending remittance submissions",
                "Tignan ang mga sumusunod:",
                "&nbsp;&nbsp;• Total Cash Collected - Tumutugma ba sa records?",
                "&nbsp;&nbsp;• Total Expenses - Makatwiran ba at may dokumento?",
                "&nbsp;&nbsp;• Commission Calculation - Tama ba ang 40%?",
                "&nbsp;&nbsp;• Expected vs Actual Amount - May pagkakaiba ba?",
                "&nbsp;&nbsp;• Paliwanag ng Technician - Kung may pagkakaiba",
                "I-click ang <strong>View Details</strong> para makita ang individual payments at expenses",
                "Bilangin ang actual cash na ibinigay ng technician",
                "Kung tama lahat: I-click ang <strong>Approve Remittance</strong>",
                "&nbsp;&nbsp;• Lahat ng payments ay magiging 'Verified'",
                "&nbsp;&nbsp;• Remittance status ay magiging 'Verified'",
                "Kung may problema: I-click ang <strong>Reject Remittance</strong>",
                "&nbsp;&nbsp;• Payments ay babalik sa 'Pending'",
                "&nbsp;&nbsp;• Kailangan i-resubmit ng technician with corrections"
            ]
        },
        tips: {
            en: [
                "Always count cash before approving - trust but verify",
                "Check expense receipts if amount is unusually high",
                "Small discrepancies (<₱50) may be due to rounding or small change issues",
                "Large discrepancies require thorough investigation",
                "Reject if technician cannot explain difference clearly",
                "Keep record of serial rejects - may indicate training need or issues"
            ],
            tl: [
                "Laging bilangin ang cash bago mag-approve - trust but verify",
                "Tignan ang receipts kung mataas ang expenses",
                "Maliliit na pagkakaiba (<₱50) ay maaaring dahil sa barya o rounding",
                "Malalaking pagkakaiba ay kailangan ng masinsinang imbestigasyon",
                "I-reject kung hindi malinaw ang paliwanag ng technician",
                "Tandaan ang paulit-ulit na reject - sign ng kailangan ng training o may problema"
            ]
        }
    },

    // Back Jobs (Warranty Returns)
    backJobs: {
        title: {
            en: "Back Jobs (Warranty Returns)",
            tl: "Back Jobs (Warranty Returns)"
        },
        summary: {
            en: "How to handle devices returning with the same issue",
            tl: "Paano hawakan ang device na bumalik na may parehong problema"
        },
        steps: {
            en: [
                "When receiving the device, check <strong>Back Job</strong> checkbox",
                "System shows list of <strong>recent completed repairs</strong> for this customer",
                "Select the <strong>original technician</strong> who did the first repair",
                "Enter <strong>Back Job Reason</strong> - Why is it returning?",
                "&nbsp;&nbsp;• Same issue persists",
                "&nbsp;&nbsp;• Related problem appeared",
                "&nbsp;&nbsp;• Customer not satisfied with repair quality",
                "Pricing is <strong>auto-approved</strong> (warranty claim - no new charge)",
                "Device goes directly to the original technician's 'My Jobs'",
                "Technician must re-diagnose and fix properly",
                "No payment should be collected (warranty work)",
                "When complete, mark as 'Ready for Pickup' as usual"
            ],
            tl: [
                "Habang tumatanggap ng device, markahan ang <strong>Back Job</strong> checkbox",
                "Lalabas ang listahan ng <strong>recent completed repairs</strong> ng customer",
                "Piliin ang <strong>original technician</strong> na gumawa ng una",
                "Ilagay ang <strong>Back Job Reason</strong> - Bakit bumalik?",
                "&nbsp;&nbsp;• Same issue persists - Hindi pa rin ayos",
                "&nbsp;&nbsp;• Related problem appeared - May bagong problema related sa una",
                "&nbsp;&nbsp;• Customer not satisfied - Hindi satisfied ang customer",
                "Ang pricing ay <strong>auto-approved</strong> (warranty claim - walang bagong bayad)",
                "Deretso sa 'My Jobs' ng original technician ang device",
                "Kailangan i-diagnose ulit at ayusin ng maayos ng technician",
                "Walang babayaran ang customer (warranty work)",
                "Pagkatapos ayusin, markahan as 'Ready for Pickup' as usual"
            ]
        },
        tips: {
            en: [
                "Back jobs are warranty work - customer shouldn't pay again for same issue",
                "Original technician is responsible - they must fix it properly this time",
                "If different issue, it's NOT a back job - treat as new repair",
                "Document thoroughly why it failed first time to prevent future issues",
                "Too many back jobs may indicate poor repair quality"
            ],
            tl: [
                "Ang back jobs ay warranty work - hindi na dapat magbayad ulit ang customer",
                "Ang original technician ang responsible - dapat ayusin nang maayos ngayon",
                "Kung ibang problema, HINDI back job - new repair ang treatment",
                "I-document ng mabuti kung bakit bumalik para hindi na maulit",
                "Maraming back jobs ay sign ng poor repair quality"
            ]
        }
    },

    // Parts Cost Recording
    partsCost: {
        title: {
            en: "Record Parts Cost",
            tl: "Isulat ang Presyo ng Parts"
        },
        summary: {
            en: "How to record actual parts costs after purchase",
            tl: "Paano isulat ang tunay na presyo ng parts pagkatapos bilhin"
        },
        steps: {
            en: [
                "Find the repair in your <strong>My Jobs</strong> or <strong>In Progress</strong> tab",
                "Click <strong>Record Parts Cost</strong> button",
                "Enter <strong>Parts Cost</strong> - How much you actually paid for parts",
                "Add <strong>Parts Cost Notes</strong>:",
                "&nbsp;&nbsp;• What specific parts were purchased",
                "&nbsp;&nbsp;• Where you bought them (supplier name)",
                "&nbsp;&nbsp;• Any relevant details",
                "Click <strong>Save Parts Cost</strong>",
                "This is tracked separately from quoted pricing",
                "Used for profit calculation and inventory analysis"
            ],
            tl: [
                "Hanapin ang repair sa iyong <strong>My Jobs</strong> o <strong>In Progress</strong> tab",
                "I-click ang <strong>Record Parts Cost</strong> button",
                "Ilagay ang <strong>Parts Cost</strong> - Magkano talaga ang binayad mo sa parts",
                "Idagdag ang <strong>Parts Cost Notes</strong>:",
                "&nbsp;&nbsp;• Anong parts ang binili",
                "&nbsp;&nbsp;• Saan binili (pangalan ng supplier)",
                "&nbsp;&nbsp;• Anumang relevant na detalye",
                "I-click ang <strong>Save Parts Cost</strong>",
                "Ito ay hiwalay sa quoted pricing",
                "Ginagamit para sa profit calculation at inventory analysis"
            ]
        },
        tips: {
            en: [
                "Record immediately after purchase while details are fresh",
                "Keep receipts - may be needed for verification",
                "Parts cost helps track actual profit vs quoted price",
                "If you paid cash for parts, record as expense in daily remittance"
            ],
            tl: [
                "Isulat kaagad pagkatapos bumili habang fresh pa sa memory",
                "Ingatan ang receipts - baka kailanganin sa verification",
                "Ang parts cost ay tumutulong malaman ang tunay na profit",
                "Kung cash ang binayad, isulat as expense sa daily remittance"
            ]
        }
    }
};

// Helper function to get help content in current language
function getHelpText(key, subkey, lang) {
    lang = lang || localStorage.getItem('helpLanguage') || 'en';
    try {
        if (subkey) {
            return helpContent[key][subkey][lang] || helpContent[key][subkey]['en'];
        }
        return helpContent[key][lang] || helpContent[key]['en'];
    } catch (e) {
        console.error('Help content not found:', key, subkey);
        return '';
    }
}

// Generate HTML for collapsible help box
function generateHelpBox(topicKey, lang) {
    lang = lang || localStorage.getItem('helpLanguage') || 'en';
    const topic = helpContent[topicKey];
    
    if (!topic) {
        console.error('Help topic not found:', topicKey);
        return '';
    }

    const title = topic.title[lang];
    const summary = topic.summary[lang];
    const steps = topic.steps[lang];
    const tips = topic.tips ? topic.tips[lang] : null;

    const howTo = helpContent.ui.howTo[lang];
    const clickToExpand = helpContent.ui.clickToExpand[lang];
    const stepsLabel = helpContent.ui.steps[lang];
    const tipLabel = helpContent.ui.tip[lang];

    let html = `
        <details class="help-box" style="margin:15px 0;padding:15px;background:#e3f2fd;border-radius:8px;border-left:4px solid #1976d2;">
            <summary style="cursor:pointer;font-weight:bold;color:#1976d2;font-size:15px;">
                ❓ ${howTo} ${title} (${clickToExpand})
            </summary>
            <div style="margin-top:15px;color:#424242;line-height:1.6;">
                <p style="margin-bottom:10px;color:#666;">${summary}</p>
                <p style="margin:10px 0 5px 0;font-weight:bold;color:#1976d2;">${stepsLabel}:</p>
                <ol style="margin:5px 0 10px 20px;padding-left:0;">
    `;

    steps.forEach(step => {
        html += `<li style="margin:5px 0;">${step}</li>`;
    });

    html += `</ol>`;

    if (tips && tips.length > 0) {
        html += `<p style="margin:15px 0 5px 0;font-weight:bold;color:#2e7d32;">💡 ${tipLabel}:</p><ul style="margin:5px 0 0 20px;padding-left:0;">`;
        tips.forEach(tip => {
            html += `<li style="margin:5px 0;color:#555;">${tip}</li>`;
        });
        html += `</ul>`;
    }

    html += `</div></details>`;

    return html;
}

// ===== DAILY ROUTINE TASK DEFINITIONS =====

helpContent.dailyRoutine = {
    title: {
        en: "Daily Routine Checklist",
        tl: "Daily Routine Checklist"
    },
    description: {
        en: "Standard daily tasks for maintaining a well-organized cellphone repair shop",
        tl: "Mga karaniwang gawain araw-araw para sa maayos na cellphone repair shop"
    },
    
    // Task definitions organized by frequency
    tasks: [
        // DAILY TASKS - Opening
        {
            id: 'task_clock_in',
            frequency: 'daily',
            category: 'opening',
            title_en: 'Clock in on time',
            title_tl: 'Mag-clock in sa tamang oras',
            description_en: 'Arrive and clock in by 8:00 AM',
            description_tl: 'Dumating at mag-clock in bago mag-8:00 AM',
            isOptional: false
        },
        {
            id: 'task_check_inventory',
            frequency: 'daily',
            category: 'opening',
            title_en: 'Check parts inventory',
            title_tl: 'Tingnan ang imbentaryo ng parts',
            description_en: 'Review low stock items and pending orders',
            description_tl: 'Suriin ang mga parts na maubos na at pending na order',
            isOptional: false
        },
        {
            id: 'task_review_jobs',
            frequency: 'daily',
            category: 'opening',
            title_en: 'Review pending jobs',
            title_tl: 'Tingnan ang pending na trabaho',
            description_en: 'Check your assigned repairs and prioritize',
            description_tl: 'Tingnan ang mga repair na nakatakda sa iyo at unahin',
            isOptional: false
        },
        {
            id: 'task_workspace_setup',
            frequency: 'daily',
            category: 'opening',
            title_en: 'Set up workstation',
            title_tl: 'Ihanda ang workstation',
            description_en: 'Organize tools, clean workspace, check equipment',
            description_tl: 'Ayusin ang mga tool, linisin ang workspace, tingnan ang equipment',
            isOptional: false
        },
        
        // DAILY TASKS - Operations
        {
            id: 'task_cleanliness',
            frequency: 'daily',
            category: 'operations',
            title_en: 'Maintain workspace cleanliness',
            title_tl: 'Panatilihing malinis ang workspace',
            description_en: 'Keep work area clean and organized throughout the day',
            description_tl: 'Panatilihing malinis at maayos ang work area buong araw',
            isOptional: false
        },
        {
            id: 'task_device_handling',
            frequency: 'daily',
            category: 'operations',
            title_en: 'Handle devices with care',
            title_tl: 'Mag-ingat sa paghawak ng devices',
            description_en: 'Use ESD protection, avoid scratches, document condition',
            description_tl: 'Gumamit ng ESD protection, iwasang magasgas, isulat ang kondisyon',
            isOptional: false
        },
        {
            id: 'task_customer_updates',
            frequency: 'daily',
            category: 'operations',
            title_en: 'Provide customer updates',
            title_tl: 'Mag-update sa customer',
            description_en: 'Communicate repair status to customers',
            description_tl: 'Ipaalam ang status ng repair sa mga customer',
            isOptional: false
        },
        {
            id: 'task_quality_check',
            frequency: 'daily',
            category: 'operations',
            title_en: 'Quality check repairs',
            title_tl: 'Suriin ang kalidad ng repair',
            description_en: 'Test all functions before marking complete',
            description_tl: 'Subukan lahat ng function bago sabihing tapos na',
            isOptional: false
        },
        
        // DAILY TASKS - Closing
        {
            id: 'task_remittance',
            frequency: 'daily',
            category: 'closing',
            title_en: 'Submit daily remittance',
            title_tl: 'Ipasa ang arawang remittance',
            description_en: 'Record all payments and expenses, submit remittance',
            description_tl: 'Isulat lahat ng bayad at gastos, ipasa ang remittance',
            isOptional: false
        },
        {
            id: 'task_organize_parts',
            frequency: 'daily',
            category: 'closing',
            title_en: 'Organize parts and tools',
            title_tl: 'Ayusin ang parts at tools',
            description_en: 'Return parts to proper storage, organize tools',
            description_tl: 'Ibalik ang parts sa tamang lugar, ayusin ang mga tool',
            isOptional: false
        },
        {
            id: 'task_cleanup',
            frequency: 'daily',
            category: 'closing',
            title_en: 'End-of-day cleanup',
            title_tl: 'Paglilinis sa katapusan ng araw',
            description_en: 'Clean workstation, dispose of waste properly',
            description_tl: 'Linisin ang workstation, itapon ng maayos ang basura',
            isOptional: false
        },
        {
            id: 'task_clock_out',
            frequency: 'daily',
            category: 'closing',
            title_en: 'Clock out properly',
            title_tl: 'Mag-clock out ng maayos',
            description_en: 'Complete all tasks before clocking out',
            description_tl: 'Tapusin lahat ng gawain bago mag-clock out',
            isOptional: false
        },
        
        // WEEKLY TASKS
        {
            id: 'task_deep_clean',
            frequency: 'weekly',
            category: 'maintenance',
            title_en: 'Deep clean workstation',
            title_tl: 'Masinsinang linis ng workstation',
            description_en: 'Thorough cleaning of work area, equipment, tools',
            description_tl: 'Masinsinang paglilinis ng work area, equipment, tools',
            isOptional: false
        },
        {
            id: 'task_inventory_organize',
            frequency: 'weekly',
            category: 'maintenance',
            title_en: 'Organize parts inventory',
            title_tl: 'Ayusin ang imbentaryo ng parts',
            description_en: 'Sort, label, and arrange parts in proper storage',
            description_tl: 'Ayusin, lagyan ng label, at isaayos ang mga parts',
            isOptional: false
        },
        {
            id: 'task_tools_check',
            frequency: 'weekly',
            category: 'maintenance',
            title_en: 'Check tools and equipment',
            title_tl: 'Tingnan ang tools at equipment',
            description_en: 'Inspect tools for damage, test equipment functionality',
            description_tl: 'Suriin ang tools kung may sira, subukan ang equipment',
            isOptional: false
        },
        {
            id: 'task_review_performance',
            frequency: 'weekly',
            category: 'review',
            title_en: 'Review week performance',
            title_tl: 'Suriin ang performance ng linggo',
            description_en: 'Check completed jobs, customer feedback, areas for improvement',
            description_tl: 'Tingnan ang natapos na trabaho, feedback ng customer, ano pa ang pwedeng gawing mas maganda',
            isOptional: false
        },
        
        // MONTHLY TASKS
        {
            id: 'task_inventory_audit',
            frequency: 'monthly',
            category: 'audit',
            title_en: 'Full inventory audit',
            title_tl: 'Kumpletong audit ng imbentaryo',
            description_en: 'Count all parts, verify records, report discrepancies',
            description_tl: 'Bilangin lahat ng parts, i-verify ang records, iulat ang mga pagkakaiba',
            isOptional: false
        },
        {
            id: 'task_customer_feedback',
            frequency: 'monthly',
            category: 'review',
            title_en: 'Review customer feedback',
            title_tl: 'Suriin ang feedback ng customer',
            description_en: 'Analyze customer reviews and complaints, identify patterns',
            description_tl: 'Suriin ang mga review at reklamo ng customer, hanapin ang pattern',
            isOptional: false
        },
        {
            id: 'task_equipment_maintenance',
            frequency: 'monthly',
            category: 'maintenance',
            title_en: 'Equipment maintenance check',
            title_tl: 'Maintenance check ng equipment',
            description_en: 'Thorough inspection and maintenance of all repair equipment',
            description_tl: 'Masinsinang inspeksyon at maintenance ng lahat ng repair equipment',
            isOptional: false
        }
    ]
};

// Shop task templates (admin-configurable)
helpContent.shopTaskTemplatesContent = {
    daily: [
        {
            title_en: 'Check email for customer inquiries',
            title_tl: 'Tingnan ang email para sa tanong ng customer',
            description_en: 'Respond to customer emails and messages',
            frequency: 'daily'
        },
        {
            title_en: 'Update repair status board',
            title_tl: 'I-update ang status board ng repair',
            description_en: 'Keep whiteboard or digital board updated with current repairs',
            frequency: 'daily'
        },
        {
            title_en: 'Sanitize customer devices',
            title_tl: 'I-sanitize ang devices ng customer',
            description_en: 'Clean and disinfect devices before and after handling',
            frequency: 'daily'
        }
    ],
    weekly: [
        {
            title_en: 'Order low stock parts',
            title_tl: 'Umorder ng parts na maubos na',
            description_en: 'Review inventory and place orders for low stock items',
            frequency: 'weekly'
        },
        {
            title_en: 'Backup repair records',
            title_tl: 'Mag-backup ng mga record ng repair',
            description_en: 'Ensure all repair data is backed up',
            frequency: 'weekly'
        },
        {
            title_en: 'Team meeting attendance',
            title_tl: 'Dumalo sa team meeting',
            description_en: 'Attend weekly team meeting to discuss issues and updates',
            frequency: 'weekly'
        }
    ],
    monthly: [
        {
            title_en: 'Skills training or learning',
            title_tl: 'Mag-aral ng bagong skills',
            description_en: 'Watch repair tutorials, learn new techniques',
            frequency: 'monthly'
        },
        {
            title_en: 'Calibrate testing equipment',
            title_tl: 'I-calibrate ang testing equipment',
            description_en: 'Ensure all testing tools are properly calibrated',
            frequency: 'monthly'
        }
    ]
};

// Export functions
window.getHelpText = getHelpText;
window.generateHelpBox = generateHelpBox;
window.helpContent = helpContent;
