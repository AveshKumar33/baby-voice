import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Transcript {
    @Prop()
    text: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
