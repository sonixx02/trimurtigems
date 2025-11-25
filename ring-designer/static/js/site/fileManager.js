class FileManager {
    constructor(tool) {
        this.tool = tool;
        this.fileName = '';
    }

    getFileName() {
        return this.fileName;
    }

    setFileName(name) {
        this.fileName = name;
    }

    getToolType() {
        return this.tool ? this.tool.getToolType() : '';
    }

    instanciateSave() {
        return () => {
            const jsonInfo = this.tool.getJsonInfo();
            const toolInfo = JSON.stringify(this.tool.getToolInfo());
            
            const saveData = {
                tooltype: this.getToolType(),
                jsonInfo: jsonInfo,
                toolInfo: toolInfo
            };

            const blob = new Blob([JSON.stringify(saveData)], {type: 'application/json'});
            this.downloadFile(blob);
        };
    }

    downloadFile(blob) {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const ext = '.jweel';
        
        if (this.fileName) {
            a.download = this.fileName + ext;
        } else {
            a.download = 'model' + ext;
        }

        if (document.createEvent) {
            const event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            a.dispatchEvent(event);
        } else {
            a.click();
        }
    }

    updateObjectData(volume, surface, aabb) {
        this.volume = volume;
        this.surface = surface;
        this.aabb = aabb;
    }
}