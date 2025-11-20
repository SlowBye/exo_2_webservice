
class NoteCreateDto {
    constructor(data = {}) {
        this.title = typeof data.title === 'string' ? data.title.trim() : undefined;
        this.content = typeof data.content === 'string' ? data.content.trim() : undefined;
    }

    validate() {
        const errors = [];

        if (this.title === undefined && this.content === undefined) {
            errors.push('Au moins un des champs "title" ou "content" doit être fourni.');
        }

        if (this.title !== undefined && this.title.length === 0) {
            errors.push('"title" ne peut pas être vide.');
        }

        if (this.content !== undefined && this.content.length === 0) {
            errors.push('"content" ne peut pas être vide.');
        }

        return { valid: errors.length === 0, errors };
    }

    toObject() {
        const obj = {};
        if (this.title !== undefined) obj.title = this.title;
        if (this.content !== undefined) obj.content = this.content;
        return obj;
    }

    static from(data) {
        return new NoteCreateDto(data);
    }
}

export { NoteCreateDto };