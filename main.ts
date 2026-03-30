import { 
    EvenAppBridge, 
    waitForEvenAppBridge, 
    CreateStartUpPageContainer, 
    RebuildPageContainer,
    TextContainerProperty,
    OsEventTypeList
} from '@evenrealities/even_hub_sdk';

const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
let isRendered = false;

/**
 * イベントオブジェクトから種類を判別する (Pongのロジックを参考)
 */
function resolveEventType(event: any): OsEventTypeList | undefined {
    // 構造に基づいてイベントを特定
    const raw = event.sysEvent?.eventType ?? event.jsonData?.eventType;

    if (typeof raw === 'number') {
        switch (raw) {
            case 0: return OsEventTypeList.CLICK_EVENT;
            case 1: return OsEventTypeList.SCROLL_TOP_EVENT;
            case 2: return OsEventTypeList.SCROLL_BOTTOM_EVENT;
            case 3: return OsEventTypeList.DOUBLE_CLICK_EVENT;
        }
    }
    
    // 特定のプロパティが存在する場合もクリックとみなす
    if (event.sysEvent || event.textEvent || event.listEvent) {
        return OsEventTypeList.CLICK_EVENT;
    }
    return undefined;
}

async function updateDisplay(content: string) {
    try {
        const bridge = EvenAppBridge.getInstance();
        const config = {
            containerTotalNum: 1,
            textObject: [
                new TextContainerProperty({
                    containerID: 1,
                    containerName: 'info-label',
                    content: content,
                    xPosition: 20,
                    yPosition: 20,
                    width: 500,
                    height: 100,
                    isEventCapture: 1
                })
            ]
        };

        if (!isRendered) {
            await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(config));
            isRendered = true;
        } else {
            await bridge.rebuildPageContainer(new RebuildPageContainer(config));
        }
        if (statusEl) statusEl.textContent = `Glass: ${content}`;
    } catch (err) {
        console.error("Update failed:", err);
    }
}

async function init() {
    try {
        await waitForEvenAppBridge();
        const bridge = EvenAppBridge.getInstance();

        // メガネ側からのイベントを監視
        bridge.onEvenHubEvent((event) => {
            const type = resolveEventType(event);
            console.log("Event Type:", type);

            switch (type) {
                case OsEventTypeList.SCROLL_TOP_EVENT:
                    updateDisplay("Up Pressed!");
                    break;
                case OsEventTypeList.SCROLL_BOTTOM_EVENT:
                    updateDisplay("Down Pressed!");
                    break;
                case OsEventTypeList.CLICK_EVENT:
                    updateDisplay("Click Pressed!");
                    break;
                case OsEventTypeList.DOUBLE_CLICK_EVENT:
                    updateDisplay("Double Click Pressed!");
                    break;
            }
        });

        // 初期化待ち
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 初期状態の表示
        resetBtn.disabled = false;
        await updateDisplay("Connected!");

        // ブラウザ側リセットボタンの動作
        resetBtn.addEventListener('click', () => {
            updateDisplay("Connected!");
        });

    } catch (err) {
        console.error("Initialization failed:", err);
    }
}

init();