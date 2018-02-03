var Person = {
    template: '<div>A custom component! {{name}}</div>',
    data: function () {
        return {
            name: ''
        }
    }
}

var Avator = {
    template: `<div class="avator-wrapper" :style="pos">
        <div class="avator" :style="pic"></div>
    </div>`,
    props: {
        name: {
            type: String,
            default: ''
        },
        picUrl: {
            type: String,
            default: ''
        },
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        }
    },
    computed: {
        pos: function () {
            return {
                left: this.x + r1 - d/2 + 'px',
                top: r1 - this.y - d/2 + 'px'
            }
        },
        pic: function () {
            return {
                backgroundImage: `url(${this.picUrl})`
            }
        }
    }
}

var Avators = {
    template: `<div><avator v-for="item in data" :key="item.name" :name="item.name" :pic-url="item.picUrl" :x="item.x" :y="item.y"></avator></div>`,
    props: {
        data: {
            type: Array,
            default: []
        }
    },
    components: {
        'avator': Avator
    },
    created() {
        // 总数
        var count = this.data.length
        var angle = 360/count;

        // 半径
        var circleD = (r1 - r2)/2 + r2

        this.data.forEach((item, index, self) => {
            var personAngle = angle*index;
            item.x = Math.sin(personAngle*2*Math.PI/360) * circleD
            item.y = Math.cos(personAngle*2*Math.PI/360) * circleD
        })

        
    }
}

var vm = new Vue({
    el: '#app',
    components: {
        'person': Person,
        'avator': Avator,
        'avators': Avators
    },
    data: function () {
        return {
            persons: persons,
            objStyle: {},
            prizes: [],
            luckyPersons: [],
            setting: false,
            showList: false,
            form: {
                name: '',
                award: '',
                count: 1
            },
            currentPrize: '',
            gamemode: '2',
            onAnimation: false,
            iconSound: './Pic/SOUND PLUS.png',
            showPrize: false,
            tip: '',
            prizeSrc: ''
        }
    },
    mounted(){
        this.$refs.wrapper.addEventListener('animationend', this.animationend)
        var localPrizes = JSON.parse(localStorage.getItem('prizes'))
        if (localPrizes) {
            this.prizes = localPrizes.slice(0)
        }
        var localPersons = JSON.parse(localStorage.getItem('luckyPersons'))
        if (localPersons) {
            this.luckyPersons = localPersons.slice(0)
        }
        this.$refs.bakMusicGet.addEventListener('ended', this.playBak)
    },
    methods: {
        openShowList() {
            this.showList = !this.showList
            if (this.showList) {
                Vue.nextTick(() => this.$refs.listTable.doLayout())
            }
        },
        openSetting() {
            this.setting = !this.setting
            if (this.setting) {
                Vue.nextTick(() => this.$refs.prizeTable.doLayout())
            }
        },
        toggleSound() {
            if (this.$refs.bakMusic.paused) {
                this.$refs.bakMusic.play()
                this.iconSound = './Pic/SOUND PLUS.png'
            } else {
                this.$refs.bakMusic.pause()
                this.iconSound = './Pic/SOUND MINUS.png'
            }
            // this.showPrize = !this.showPrize
        },
        pauseBak() {
            if (!this.$refs.bakMusic.paused){
                this.$refs.bakMusic.pause()
                this.iconSound = './Pic/SOUND MINUS.png'
            }
        },
        playBak() {
            if (this.$refs.bakMusic.paused) {
                this.$refs.bakMusic.play()
                this.iconSound = './Pic/SOUND PLUS.png'
            }
        },
        customAlert(msg, src) {
            this.tip = msg
            this.showPrize = true
            this.prizeSrc = src
        },
        reset() {
            var ret = confirm('重新抽奖将删除所有已中奖人，确认重新抽奖么？')
            if (!ret){
                return
            }
            this.luckyPersons.splice(0)
            localStorage.setItem('luckyPersons', JSON.stringify(this.luckyPersons))
            this.prizes.forEach(item => item.remain = item.count)
            localStorage.setItem('prizes', JSON.stringify(this.prizes))
            this.currentPrize = ''
        },
        allreset() {
            var ret = confirm('全部重置将删除所有已中奖人与奖品配置，确认全部重置么？')
            if (!ret){
                return
            }
            this.luckyPersons.splice(0)
            this.prizes.splice(0)
            localStorage.setItem('luckyPersons', JSON.stringify(this.luckyPersons))
            localStorage.setItem('prizes', JSON.stringify(this.prizes))
            this.currentPrize = ''
        },
        add() {
            if (this.prizes.map(item => item.name).indexOf(this.form.name) !== -1){
                this.$alert(`奖项${this.form.name}已经存在`, '提示', {
                    confirmButtonText: '确定'
                })
                return
            }
            this.prizes.push({
                name: this.form.name,
                award: this.form.award,
                count: this.form.count,
                remain: this.form.count
            })
            localStorage.setItem('prizes', JSON.stringify(this.prizes))
            console.log(this.prizes)
        },
        deletePrize(row) {
            var list = this.prizes.filter(item => item.name !== row.name)
            this.prizes = list.slice(0)
            this.currentPrize = ''
            localStorage.setItem('prizes', JSON.stringify(this.prizes))
        },
        startAnimation: function (e) {
            if (!this.currentPrize) {
                this.$alert('请选择奖项', '提示', {
                    confirmButtonText: '确定'
                })
                return
            }
            if (hasClass(this.$refs.btnstart, 'disabled')){
                return;
            }

            if (this.gamemode == '1' && !this.onAnimation){
                addClass(this.$refs.wrapper, 'circle');
                this.onAnimation = true
                return
            }
            if (this.gamemode == '1' &&this.onAnimation) {
                removeClass(this.$refs.wrapper, 'circle');
            }
            addClass(this.$refs.btnstart, 'disabled');
            // addClass(this.$refs.wrapper, 'rotate-wrapper')
            // this.$refs.wrapper.addEventListener('animationend', () => alert('ok'))
            //setTimeout(() => removeClass(this.$refs.wrapper, 'rotate-wrapper'), 10000)
            // 重置
            this.$refs.wrapper.style.transform = ''
            // 中奖人
            this.personIndex = this.randomNumber(0, this.persons.length-1)
            console.log('中奖人是'+this.persons[this.personIndex].name+'!')
            //this.personIndex = 2
            // 
            let angle = 360/this.persons.length

            // 自动随机转12-16圈
            let turns;
            let time;
            if (this.gamemode == '2'){
                turns = this.randomNumber(16, 24)
                time = this.randomNumber(12, 16)
            } else {
                turns = this.randomNumber(3, 6)
                time = this.randomNumber(3, 6)
            }


            this.opts = this.animateionOption(turns, time, Math.floor(this.personIndex * angle))
            this.$refs.wrapper.style.animation = this.opts.running
            this.$refs.wrapper.removeEventListener
            

        },
        animationend: function animationend() {
            this.$refs.wrapper.style.animation = ''
            this.$refs.wrapper.style.transform = this.opts.end
            removeClass(this.$refs.btnstart, 'disabled')
            this.onAnimation = false
            if (this.luckyPersons.filter(item => item.person === this.persons[this.personIndex].name).length > 0){
                var ret = confirm(`${this.persons[this.personIndex].name}已经中奖了，确定有效么？`)
                if (!ret){
                    return
                }
            }

            this.pauseBak()
            this.$refs.bakMusicGet.play()
            this.customAlert('恭喜'+this.persons[this.personIndex].name+`中了${this.currentPrize}!`, this.persons[this.personIndex].picUrl)
            this.luckyPersons.push({
                name: this.currentPrize,
                award: this.prizes.filter(item => item.name === this.currentPrize)[0].award,
                person: this.persons[this.personIndex].name,
                picUrl: this.persons[this.personIndex].picUrl
            })

            localStorage.setItem('luckyPersons', JSON.stringify(this.luckyPersons))

            var prize = this.prizes.filter(item => item.name === this.currentPrize)[0]
            var index = this.prizes.indexOf(prize)
            prize.remain -= 1
            this.prizes.splice(index, prize)
            localStorage.setItem('prizes', JSON.stringify(this.prizes))

            if (prize.remain === 0){
                this.$alert(`${prize.name}已经抽完`, '提示', {
                    confirmButtonText: '确定'
                })
                for (i in this.prizes){
                    if (this.prizes[i].remain > 0){
                        this.currentPrize = this.prizes[i].name
                        break
                    }
                    if (i == this.prizes.length - 1){
                        this.currentPrize = ''
                        this.$alert(`全部奖项已经抽完`, '提示', {
                            confirmButtonText: '确定'
                        })
                    }
                }
            }
        },
        animateionOption: function (turns, time, fixed) {
            let bezier = this.getSomeBezier()
            let running = `run ${time}s ${bezier}`
            var edg = 360*turns
            edg -= fixed
            let rule = `@-webkit-keyframes run{
                form {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(${edg}deg)
                }`
            var style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = rule
            document.getElementsByTagName('head')[0].appendChild(style)
            this.stylesheet = document.styleSheets[document.styleSheets.length -1]
            try{
                this.stylesheet.insertRule(rule, this.stylesheet.rules.length)
            }catch(e){

            }
            let end = `rotate(${-fixed}deg)`
            return {
                running,
                end
            }
        },
        randomNumber: function (min, max) {
            return Math.floor(Math.random() *  (max - min + 1) + min)
        },
        getSomeBezier: function (){
            let index = this.randomNumber(0, 9)
            const arrs = ['ease',
            'cubic-bezier(.4,.08,.23,1.23)',
            'ease',
            'cubic-bezier(.51,.15,0,1.2)',
            'ease',
            'cubic-bezier(.51,.15,.83,1.26)',
            'ease',
            'cubic-bezier(.51,.15,.51,1.52)',
            'ease',
            'cubic-bezier(.71,.08,.84,1.69)']
            return arrs[index]
        }
    },
    created() {
        for (let i = 0; i <= 20; i++){
            console.log(this.randomNumber(0, this.persons.length-1))
        }
    }
})
