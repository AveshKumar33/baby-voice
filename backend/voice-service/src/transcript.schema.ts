import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Transcript {
    @Prop({ required: true })
    text: string;

    @Prop({ default: null })
    confidence: number;

    @Prop({ default: 'default-ml-model' })
    modelName: string;

    @Prop({ default: 'en' })
    language: string;

    @Prop({ default: 0 })
    audioDuration: number;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
