<template>
    <div class="ui-fas">
        <el-input v-model="name" @input.native="filterIcons" suffix-icon="el-icon-search" placeholder="请输入图标名称"></el-input>
        <ul class="fas-icon-list" style="max-height: 200px;overflow-y: scroll;overflow-x: hidden;list-style: none">
            <li v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
                <i :class="item" />
                <span>{{item}}</span>
            </li>
        </ul>
    </div>
</template>
<script>
    import fontawesome from '../extend/fontawesome/solid.js'
    export default {
        name: 'compIcons',
        data () {
            return {
                name: '',
                iconList: fontawesome
            }
        },
        methods: {
            filterIcons () {
                if (this.name) {
                    this.iconList = this.iconList.filter(item => item.includes(this.name))
                } else {
                    this.iconList = fontawesome
                }
            },
            selectedIcon (name) {
                this.$emit('selected', name)
            },
            reset () {
                this.name = ''
                this.iconList = fontawesome
            }
        }
    }
</script>
