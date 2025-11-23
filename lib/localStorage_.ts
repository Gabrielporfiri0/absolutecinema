
export const localStorageUtil = {

    setItem: <T>(key: string, value: T): boolean => {
        if(typeof window !== 'undefined') {
            try{
                window.localStorage.setItem(key, JSON.stringify(value))
                return true
            }catch(error){
                console.log('Erro ao salvar no local storage')
                return false
            }
        }
        return false
    },

    getItem: <T>(key: string): T | null => {
        if(typeof window !== 'undefined'){
            try{
                const item = window.localStorage.getItem(key)

                if(item) return JSON.parse(item)
                return null
            }catch(error){
                console.log(`Erro ao ler ${key} do local storage: `, error)
                return null
            }
        }
        return null
    },

    removeItem: (key: string): boolean => {
        if(typeof window !== 'undefined'){
            try{
                window.localStorage.removeItem(key)
                return true
            }catch(error){
                console.log(`Erro ao remover ${key} do local storage: `, error)
                return false
            }
        }
        return false
    },

    clear: (): boolean => {
        if(typeof window !== 'undefined'){
            try{
                window.localStorage.clear()
                return true
            }catch(error){
                console.log('Erro ao limpar local storage: ', error)
                return false
            }
        }
        return false
    }
}